#!/usr/bin/env node

/**
 * 把 Hexo 生成的静态站（只有 HTML 产物、没有 Markdown 源文件）里的文章
 * 反向转换成 Astro content collection 的 Markdown 文章。
 *
 * 支持两种常见的 Hexo 输出结构：
 *   1. butterfly 主题（post_asset_folder + 哈希永久链接）
 *        /posts/<hash>/index.html            -> blog2
 *   2. next 主题（:year/:month/:day/:title 永久链接）
 *        /2019/10/20/<slug>/index.html       -> blog1
 *
 * 每个站点的处理流程：
 *   - 定位正文容器（#article-container / .post-body）
 *   - 清理 headerlink 锚点、分享/版权/评论等非正文节点
 *   - 把 Hexo 的 <figure class="highlight xxx"><table> 代码块还原成标准
 *     ``` 围栏代码块（含 <br> → 换行、丢弃行号列）
 *   - 把 lazyload 的 data-src 还原成 src
 *   - 把文章同目录下的本地图片复制到 src/content/posts/attachments/ 并改写路径
 *   - 站内旧文章链接重写为新站链接
 *   - 输出与项目现有文章一致的 frontmatter（title/date/updated/category/tags/...）
 *   - 与已有文章做内容相似度比对，疑似重复的默认跳过（可 --include-duplicates 强制导入）
 *
 * 用法：
 *   node scripts/import-hexo.mjs --dry-run          # 只预览，不写文件
 *   node scripts/import-hexo.mjs                    # 导入 /var/www/blog1 + /var/www/blog2
 *   node scripts/import-hexo.mjs --src /var/www/blog1
 *   node scripts/import-hexo.mjs --slug old         # 用旧永久链接当 slug（保留旧 URL）
 *   node scripts/import-hexo.mjs --include-duplicates
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts')
const ATTACH_DIR = path.join(POSTS_DIR, 'attachments')
const REPORT_FILE = path.join(__dirname, 'import-report.md')
const REDIRECT_FILE = path.join(ROOT, 'deploy', 'redirects-imported.json')

/* ─── CLI ────────────────────────────────────────────────────────────── */

const flags = {
  src: [],
  slug: 'title',
  dryRun: false,
  includeDuplicates: false,
  cover: true,
  limit: Infinity,
  dupThreshold: 0.4,
}

const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--src') flags.src.push(path.resolve(argv[++i]))
  else if (a === '--slug') flags.slug = argv[++i]
  else if (a === '--dry-run') flags.dryRun = true
  else if (a === '--include-duplicates') flags.includeDuplicates = true
  else if (a === '--no-cover') flags.cover = false
  else if (a === '--limit') flags.limit = Number(argv[++i])
  else if (a === '--dup-threshold') flags.dupThreshold = Number(argv[++i])
  else if (a === '-h' || a === '--help') {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf-8').split('*/')[0].replace(/^\/\*\*?/, '').replace(/^\s*\* ?/gm, ''))
    process.exit(0)
  }
}
if (!flags.src.length)
  flags.src = ['/var/www/blog1', '/var/www/blog2']

/* ─── 工具 ───────────────────────────────────────────────────────────── */

const pad = (n) => String(n).padStart(2, '0')

/** 把各种日期形式归一成 YYYY-MM-DD。ISO 带 Z（UTC）时按 +8 折算成作者本地日期。 */
function toLocalDate(input) {
  if (!input)
    return ''
  const s = String(input).trim()
  const direct = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (direct && !/Z$/.test(s))
    return `${direct[1]}-${pad(direct[2])}-${pad(direct[3])}`
  const d = new Date(s)
  if (Number.isNaN(d.getTime()))
    return direct ? `${direct[1]}-${pad(direct[2])}-${pad(direct[3])}` : ''
  const local = new Date(d.getTime() + 8 * 3600 * 1000)
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`
}

function yamlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`
}

/**
 * 复刻 Astro 生成 post slug 的规则（github-slugger：小写 + 去掉符号），
 * 这样报告里的"新链接"才和实际构建出来的 URL 一致。
 */
const GithubSlugger = await import('github-slugger').then(m => m.default).catch(() => null)
function toSlug(name) {
  if (GithubSlugger)
    return new GithubSlugger().slug(name)
  return name.toLowerCase().replace(/[^\p{L}\p{N}\p{M}\-_ ]/gu, '').replace(/\s+/g, '-')
}

/** 文件名安全化：去掉路径非法字符，保留中文 */
function safeName(title) {
  return String(title)
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 80) || 'untitled'
}

function fileHash(file) {
  return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex')
}

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'])
const isFile = p => {
  try {
    return fs.statSync(p).isFile()
  }
  catch {
    return false
  }
}

/** 按魔数判断图片真实类型（Hexo 里有些资源没有扩展名） */
function sniffExt(file) {
  try {
    const fd = fs.openSync(file, 'r')
    const buf = Buffer.alloc(12)
    fs.readSync(fd, buf, 0, 12, 0)
    fs.closeSync(fd)
    if (buf.subarray(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF])))
      return '.jpg'
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])))
      return '.png'
    if (buf.subarray(0, 3).toString('latin1') === 'GIF')
      return '.gif'
    if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP')
      return '.webp'
    if (buf.subarray(0, 2).toString('latin1') === 'BM')
      return '.bmp'
  }
  catch {}
  return ''
}

/**
 * 归档文件名：保证有图片扩展名（否则 Astro 会把它当模块解析导致构建失败），
 * 过长的（base64 之类的）名字截断并加内容哈希避免撞名。
 */
function archiveName(absFile) {
  const orig = path.basename(absFile)
  const origExt = path.extname(orig).toLowerCase()
  const ext = IMAGE_EXT.has(origExt) ? origExt : (sniffExt(absFile) || '.png')
  let stem = safeName(orig.slice(0, orig.length - path.extname(orig).length))
    .replace(/[!]+/g, '-')
    .replace(/-+$/, '')
  if (stem.length > 60)
    stem = `${stem.slice(0, 40)}-${fileHash(absFile).slice(0, 8)}`
  return `${stem}${ext}`
}

/** 站点图片资源索引（按文件名小写）：用于补救 Hexo 里被移动过的图片路径 */
const assetIndexCache = new Map()
function assetIndex(root) {
  if (assetIndexCache.has(root))
    return assetIndexCache.get(root)
  const map = new Map()
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules')
        continue
      const p = path.join(dir, e.name)
      if (e.isDirectory()) {
        walk(p)
      }
      else if (IMAGE_EXT.has(path.extname(e.name).toLowerCase())) {
        const key = e.name.toLowerCase()
        if (!map.has(key))
          map.set(key, p)
        const noBang = key.split('!')[0] // blog2 里有 xxx.png!large 这种存储名
        if (!map.has(noBang))
          map.set(noBang, p)
      }
    }
  }
  try {
    walk(root)
  }
  catch {}
  assetIndexCache.set(root, map)
  return map
}

/**
 * 把 Hexo 页面里的图片地址还原成源站上的真实文件：
 *   1. 按原路径直接找
 *   2. 到 assets//imag//images//img/ 等公共资源目录里找同名文件
 *   3. 兜底：全站按文件名找（只对名字足够独特的文件生效，避免同名误配）
 */
function resolveLocalImage(root, src, alt) {
  const rel = decodeURIComponent(src.replace(/^\//, ''))
  const direct = path.join(root, rel)
  if (isFile(direct))
    return direct

  const base = path.basename(rel)
  for (const dir of ['assets', 'imag', 'images', 'img']) {
    const p = path.join(root, dir, base)
    if (isFile(p))
      return p
  }

  // alt 里可能是原始文件名（Hexo 把图片名塞进了 alt）
  if (alt) {
    for (const ext of ['.png', '.jpg', '.jpeg', '.gif']) {
      for (const dir of [path.join(root, 'assets'), root, path.dirname(direct)]) {
        const p = path.join(dir, alt + ext)
        if (isFile(p))
          return p
      }
    }
  }

  if (base.length >= 12) {
    const hit = assetIndex(root).get(base.toLowerCase())
    if (hit)
      return hit
  }
  return null
}

/** 中文没有空格，所以用字符 n-gram 做相似度 */
function shingles(text, n = 5) {
  const norm = text
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[^\p{Script=Han}\p{L}\p{N}]+/gu, '')
  const set = new Set()
  for (let i = 0; i + n <= norm.length; i++)
    set.add(norm.slice(i, i + n))
  return set
}

function jaccard(a, b) {
  if (!a.size || !b.size)
    return 0
  if (Math.min(a.size, b.size) / Math.max(a.size, b.size) < 0.35)
    return 0
  let inter = 0
  const [small, big] = a.size < b.size ? [a, b] : [b, a]
  for (const s of small) {
    if (big.has(s))
      inter++
  }
  return inter / (a.size + b.size - inter)
}

/* ─── 发现文章 ───────────────────────────────────────────────────────── */

function walkIndexHtml(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory())
      walkIndexHtml(p, out)
    else if (entry.name === 'index.html')
      out.push(p)
  }
  return out
}

function discover(dirs) {
  const posts = []
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.warn(`跳过不存在的目录: ${dir}`)
      continue
    }
    const label = path.basename(dir)
    const postsDir = path.join(dir, 'posts')
    if (fs.existsSync(postsDir)) {
      // butterfly: /posts/<hash>/index.html
      for (const d of fs.readdirSync(postsDir, { withFileTypes: true })) {
        if (!d.isDirectory())
          continue
        const htmlPath = path.join(postsDir, d.name, 'index.html')
        if (!fs.existsSync(htmlPath))
          continue
        posts.push({
          label,
          kind: 'butterfly',
          root: dir,
          htmlPath,
          assetDir: path.join(postsDir, d.name),
          oldPath: `/posts/${d.name}/`,
          oldSlug: d.name,
        })
      }
    }
    else {
      // next: /2019/10/20/<slug>/index.html
      const htmlFiles = walkIndexHtml(dir, [])
      for (const htmlPath of htmlFiles) {
        const rel = path.relative(dir, htmlPath)
        const m = rel.match(/^(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/index\.html$/)
        if (!m)
          continue
        posts.push({
          label,
          kind: 'next',
          root: dir,
          htmlPath,
          assetDir: path.dirname(htmlPath),
          oldPath: `/${rel.replace(/index\.html$/, '')}`,
          oldSlug: rel.replace(/\/index\.html$/, ''),
        })
      }
    }
  }
  return posts
}

/* ─── 解析单篇 ───────────────────────────────────────────────────────── */

function parseMeta($, kind, html) {
  const meta = (name) => $(`meta[name="${name}"]`).attr('content') || ''
  if (kind === 'butterfly') {
    const title = $('meta[property="og:title"]').attr('content')
      || $('title').text().split('|')[0].trim()
    const createdText = $('.post-meta__date-created').attr('title') || ''
    const updatedText = $('.post-meta__date-updated').attr('title') || ''
    return {
      title,
      date: toLocalDate(createdText.replace(/^Created\s*/, '')) || toLocalDate($('meta[property="article:published_time"]').attr('content')),
      updated: toLocalDate(updatedText.replace(/^Updated\s*/, '')) || toLocalDate($('meta[property="article:modified_time"]').attr('content')),
      category: $('a.post-meta__categories').first().text().trim(),
      tags: $('.post-meta__tag-list a').map((_, el) => $(el).text().trim()).get().filter(Boolean),
      cover: meta('og:image'),
      description: meta('description') || '',
    }
  }

  // next 主题（itemprop 可能是 "dateCreated datePublished" 这类多值，用 ~= 词匹配）
  const created = $('time[itemprop~="dateCreated"]').first()
  const modified = $('time[itemprop~="dateModified"]').first()
  const fallback = $('time').first()
  const title = $('h1.post-title').first().text().trim()
    || $('meta[property="og:title"]').attr('content')
    || $('title').text().split('|')[0].trim()
  return {
    title,
    date: toLocalDate(created.attr('datetime')) || toLocalDate(created.text()) || toLocalDate(fallback.attr('datetime')),
    updated: toLocalDate(modified.attr('datetime')) || toLocalDate(modified.text()),
    category: $('.post-category [itemprop="name"]').first().text().trim()
      || $('.post-category a').first().text().trim(),
    tags: $('.post-tags a').map((_, el) => $(el).text().trim().replace(/^#\s*/, '')).get().filter(Boolean),
    cover: '',
    description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
  }
}

/* ─── HTML → Markdown ────────────────────────────────────────────────── */

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  hr: '---',
})
turndown.use(gfm)
turndown.keep(['iframe', 'video', 'audio', 'source', 'details', 'summary'])

/** highlight.js 有、shiki 没有的语言名，做一次归一，避免构建时刷警告 */
const LANG_ALIAS = {
  plain: '',
  plaintext: '',
  text: '',
  ansi: '',
  x86asm: 'asm',
  dos: 'bat',
  cmd: 'bat',
  ps: 'powershell',
  make: 'makefile',
}

/** 一定打不开的图片域名：旧站自有域名 + 内网地址 */
const DEAD_HOST_RE = /^https?:\/\/(?:[\w-]+\.)*(?:prontosil\.club|prontosil\.me|prontosil\.github\.io)\/|^https?:\/\/(?:192\.168\.|10\.|127\.0\.0\.1)/

function htmlToMarkdown(contentHtml, ctx) {
  const $ = cheerio.load(`<div id="__root">${contentHtml}</div>`, null, false)
  const root = $('#__root')

  // 1. 去掉非正文节点
  root.find('.headerlink, .anchor, script, style, noscript, .post-copyright, .tag_share, #post-comment, .post-nav, .reward, .copy-btn').remove()

  // 2. Hexo 高亮代码块 → 标准围栏代码块
  root.find('figure.highlight, div.highlight').each((_, el) => {
    const $el = $(el)
    const cls = $el.attr('class') || ''
    let lang = (cls.match(/highlight[\s-]+([\w+#.-]+)/) || [])[1] || ''
    if (lang in LANG_ALIAS)
      lang = LANG_ALIAS[lang]
    let pre = $el.find('td.code pre').first()
    if (!pre.length)
      pre = $el.find('pre').last()
    if (!pre.length)
      return
    pre.find('br').replaceWith('\n')
    const code = pre.text().replace(/\n+$/, '')
    const $new = $('<pre><code></code>')
    $new.find('code').attr('class', lang ? `language-${lang}` : '').text(code)
    $el.replaceWith($new)
  })

  // 3. 图片：还原 lazyload，本地图片归档到 attachments/
  root.find('img').each((_, el) => {
    const $el = $(el)
    let src = ($el.attr('data-src') || $el.attr('src') || '').trim()
    if (!src || /loading\.gif$/.test(src))
      src = ($el.attr('data-src') || '').trim()
    $el.removeAttr('data-src').removeAttr('onerror').removeAttr('loading')
    // Hexo 的 post_asset_folder 会把原文件名塞进 alt，作为 alt 文本没意义
    const alt = ($el.attr('alt') || '').trim()
    if (/^\d{8,}$/.test(alt) || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(alt))
      $el.attr('alt', '')
    if (!src) {
      $el.remove()
      return
    }
    if (/^https?:\/\//.test(src) || src.startsWith('data:')) {
      $el.attr('src', src)
      // 旧站域名 / 内网地址的图片基本已经打不开了，单独标出来
      if (DEAD_HOST_RE.test(src))
        ctx.onUnresolved({ src, alt: ($el.attr('alt') || '').trim(), remote: true })
      return
    }
    // 站内相对/绝对路径 → blog 站点目录下的本地文件
    const abs = resolveLocalImage(ctx.root, src, alt)
    if (abs) {
      $el.attr('src', ctx.archiveImage(abs))
    }
    else {
      $el.attr('src', src) // 找不到原图，保持原样（多半是失效链接）
      ctx.onUnresolved({ src, alt: ($el.attr('alt') || '').trim() })
    }
  })

  // 4. 站内旧文章链接 → 新链接
  root.find('a[href]').each((_, el) => {
    const $el = $(el)
    const href = $el.attr('href') || ''
    const hit = ctx.linkMap.get(href) || ctx.linkMap.get(href.replace(/^https?:\/\/[^/]+/, ''))
    if (hit)
      $el.attr('href', hit)
  })

  // 5. 去掉空的行内锚点
  root.find('a[name], a[id]:empty').remove()

  const markdown = turndown.turndown(root.html() || '')
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/* ─── 已有文章索引（去重用） ─────────────────────────────────────────── */

function indexExisting() {
  const list = []
  if (!fs.existsSync(POSTS_DIR))
    return list
  for (const f of fs.readdirSync(POSTS_DIR)) {
    if (!/\.mdx?$/.test(f))
      continue
    try {
      const text = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
      const title = (text.match(/^title:\s*(.*)$/m) || [])[1]?.replace(/^['"]|['"]$/g, '') || f
      list.push({ file: f, title, shingles: shingles(text) })
    }
    catch {}
  }
  return list
}

/* ─── 主流程 ─────────────────────────────────────────────────────────── */

function main() {
  if (!fs.existsSync(ATTACH_DIR))
    fs.mkdirSync(ATTACH_DIR, { recursive: true })

  const sources = discover(flags.src)
  console.log(`发现文章: ${sources.length} 篇（${flags.src.map(s => `${path.basename(s)}=${sources.filter(p => p.label === path.basename(s)).length}`).join(', ')}）`)

  // 第一遍：解析元数据，确定新 slug / 文件名，建立旧链接映射
  const entries = []
  for (const src of sources) {
    const html = fs.readFileSync(src.htmlPath, 'utf-8')
    const $ = cheerio.load(html)
    const meta = parseMeta($, src.kind, html)
    if (!meta.title)
      continue
    const baseName = flags.slug === 'old' ? safeName(src.oldSlug) : safeName(meta.title)
    let fileName = `${baseName}.md`
    let n = 2
    while (entries.some(e => e.fileName === fileName)) fileName = `${baseName}-${n++}.md`
    const slug = flags.slug === 'old' ? baseName : toSlug(baseName)
    entries.push({
      ...src,
      ...meta,
      fileName,
      newUrl: `/posts/${encodeURI(slug)}/`,
      contentHtml: (src.kind === 'butterfly' ? $('#article-container') : $('.post-body')).first().html() || '',
      shingles: null,
      duplicates: [],
    })
  }

  const linkMap = new Map()
  for (const e of entries) {
    linkMap.set(e.oldPath, e.newUrl)
    linkMap.set(e.oldPath.replace(/\/$/, ''), e.newUrl)
    // Hexo 生成站里的其它等价写法
    linkMap.set(`${e.oldPath}index.html`, e.newUrl)
  }

  // 图片归档器：同名同内容复用，同名不同内容加来源前缀
  function makeArchiver(label) {
    return (absFile) => {
      const base = archiveName(absFile)
      const dst = path.join(ATTACH_DIR, base)
      if (fs.existsSync(dst)) {
        if (fileHash(dst) === fileHash(absFile))
          return `./attachments/${base}`
        const alt = `${label}-${base}`
        const dstAlt = path.join(ATTACH_DIR, alt)
        if (!fs.existsSync(dstAlt))
          fs.copyFileSync(absFile, dstAlt)
        return `./attachments/${alt}`
      }
      if (!flags.dryRun)
        fs.copyFileSync(absFile, dst)
      return `./attachments/${base}`
    }
  }

  // 第二遍：转换正文
  const existing = indexExisting()
  const written = []
  const skipped = []
  const unresolved = []

  for (const e of entries.slice(0, flags.limit)) {
    const md = htmlToMarkdown(e.contentHtml, {
      root: e.root,
      linkMap,
      archiveImage: makeArchiver(e.label),
      onUnresolved: ref => unresolved.push({ post: e.fileName, ...ref }),
    })
    e.shingles = shingles(md)
    e.markdown = md

    // 去重：与已有文章 + 本次已导入的其它文章比对
    for (const other of existing) {
      const score = jaccard(e.shingles, other.shingles)
      if (score >= flags.dupThreshold)
        e.duplicates.push({ target: other.file, score })
    }
    for (const other of written) {
      const score = jaccard(e.shingles, other.shingles)
      if (score >= flags.dupThreshold)
        e.duplicates.push({ target: other.fileName, score })
    }
    e.duplicates.sort((a, b) => b.score - a.score)
    e.duplicates = e.duplicates.slice(0, 2)

    const isDup = e.duplicates.length > 0

    if (isDup && !flags.includeDuplicates) {
      console.log(`  跳过(疑似重复 ${(e.duplicates[0].score * 100).toFixed(0)}% → ${e.duplicates[0].target}): ${e.title}`)
      skipped.push(e)
      written.push(e)
      continue
    }

    const tags = [...new Set(e.tags.map(t => t.trim()).filter(Boolean))]
    const fm = [
      '---',
      `title: ${yamlStr(e.title)}`,
      `date: ${e.date || '1970-01-01'}`,
    ]
    if (e.updated && e.updated !== e.date)
      fm.push(`updated: ${e.updated}`)
    if (flags.cover && e.cover)
      fm.push(`image: ${yamlStr(e.cover)}`)
    fm.push(`category: ${yamlStr(e.category || '未分类')}`)
    if (tags.length) {
      fm.push('tags:')
      for (const t of tags) fm.push(`  - ${yamlStr(t)}`)
    }
    else {
      fm.push('tags: []')
    }
    fm.push(`lang: 'zh'`)
    fm.push('draft: false')
    fm.push('---', '')

    const body = `${fm.join('\n')}${e.markdown}\n`
    written.push(e)

    if (!flags.dryRun) {
      fs.writeFileSync(path.join(POSTS_DIR, e.fileName), body)
    }
    else {
      const out = path.join('/tmp', `hexo-import-preview-${safeName(e.fileName)}`)
      fs.writeFileSync(out, body)
    }
  }

  // 报告 + 旧链接映射
  const redirects = {}
  for (const e of entries)
    redirects[e.oldPath] = e.newUrl

  const report = [
    '# Hexo 文章导入报告',
    '',
    `- 生成时间: ${new Date().toISOString()}`,
    `- 来源: ${flags.src.join(', ')}`,
    `- 发现文章: ${entries.length}`,
    `- 已导入: ${entries.length - skipped.length}`,
    `- 疑似重复跳过: ${skipped.length}`,
    `- 失效的图片引用: ${unresolved.length}（原站就已丢失 / 旧域名，保留原路径）`,
    `- 模式: ${flags.dryRun ? 'dry-run（未写入）' : '已写入 src/content/posts/'}`,
    '',
    ...(unresolved.length
      ? [
          '## 失效的图片引用（源站文件已不存在 / 旧域名，保留原路径，需自行补图或忽略）',
          '',
          '| 文章 | 路径 | 类型 | 原始文件名(alt) |',
          '| --- | --- | --- | --- |',
          ...unresolved.map(u => `| ${u.post} | \`${u.src}\` | ${u.remote ? '远程失效' : '本地缺失'} | ${u.alt || '-'} |`),
          '',
        ]
      : []),
    ...(skipped.length
      ? [
          '## 疑似重复（未导入，确认后可加 --include-duplicates 重跑）',
          '',
          '| 文章 | 相似度 | 已存在的文章 |',
          '| --- | --- | --- |',
          ...skipped.map(e => `| ${e.title} | ${(e.duplicates[0].score * 100).toFixed(0)}% | ${e.duplicates[0].target} |`),
          '',
        ]
      : []),
    '## 旧链接 → 新链接',
    '',
    '| 旧地址 | 新地址 |',
    '| --- | --- |',
    ...entries.map(e => `| \`${e.oldPath}\` | \`${e.newUrl}\` |`),
    '',
  ].join('\n')

  if (!flags.dryRun) {
    fs.writeFileSync(REPORT_FILE, report)
    if (!fs.existsSync(path.dirname(REDIRECT_FILE)))
      fs.mkdirSync(path.dirname(REDIRECT_FILE), { recursive: true })
    fs.writeFileSync(REDIRECT_FILE, `${JSON.stringify(redirects, null, 2)}\n`)
  }

  console.log(`\n完成：转换 ${entries.length} 篇，可导入 ${entries.length - skipped.length} 篇，跳过重复 ${skipped.length} 篇${flags.includeDuplicates ? '（已强制包含）' : ''}`)
  if (unresolved.length)
    console.log(`失效的本地图片引用 ${unresolved.length} 处（原站已丢失，详见报告）`)
  console.log(flags.dryRun
    ? `dry-run 预览已写入 /tmp/hexo-import-preview-*.md`
    : `报告: ${path.relative(ROOT, REPORT_FILE)}，旧链接映射: ${path.relative(ROOT, REDIRECT_FILE)}`)
}

main()
