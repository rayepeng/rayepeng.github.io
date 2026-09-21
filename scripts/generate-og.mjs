#!/usr/bin/env node

/**
 * 生成 Open Graph 分享卡片（1200×630）。
 *
 * 没有手工封面的文章 → 用正文第一张图铺底，叠上标题/日期/标签，输出 public/og/<slug>.png。
 * 已经手工给过封面的文章 → 直接沿用那张封面（多数本身已带标题），不再叠字，避免双标题。
 * 另外生成站点默认图 public/og.png，供首页等页面使用。
 *
 * 构建时运行（见 package.json 的 build 脚本），产物不进版本库。
 *
 * 用法：
 *   node scripts/generate-og.mjs               # 生成（已存在且比源文件新则跳过）
 *   node scripts/generate-og.mjs --force       # 全部重新生成
 *   node scripts/generate-og.mjs --only=<slug> # 只生成某一篇
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { slug as githubSlug } from 'github-slugger'
import matter from 'gray-matter'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = join(ROOT, 'src/content/posts')
const OUT_DIR = join(ROOT, 'public/og')
const SITE_OG = join(ROOT, 'public/og.jpg')

const WIDTH = 1200
const HEIGHT = 630
const PADDING = 72

const SITE_NAME = "Raye's Journey"
const SITE_TAGLINE = '无人调护，自去经心'
const SITE_URL = 'https://rayepeng.net'

// 中文字形来自系统字体，靠 fontconfig 回退；按优先级给候选
const FONT_STACK = [
  'Noto Sans CJK SC',
  'Noto Sans SC',
  'Source Han Sans SC',
  'PingFang SC',
  'WenQuanYi Zen Hei',
  'Noto Sans',
  'DejaVu Sans',
  'sans-serif',
]
  .map((f) => (f.includes(' ') ? `'${f}'` : f))
  .join(', ')

const args = new Set(process.argv.slice(2))
const FORCE = args.has('--force')
const ONLY = [...args].find((a) => a.startsWith('--only='))?.slice('--only='.length)

/* ── 工具函数 ─────────────────────────────────────────────────────────── */

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value ?? '')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** 估算文字在给定字号下的显示宽度：中日韩按一个字宽，西文约半个字宽。 */
function textWidth(text, fontSize) {
  let units = 0
  for (const ch of text) {
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(ch)) units += 1
    else if (/\s/.test(ch)) units += 0.3
    else if (/[A-Z]/.test(ch)) units += 0.62
    else units += 0.52
  }
  return units * fontSize
}

// 中日韩标点也一并算进「宽字符」
const CJK_RANGES = '\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef'
// 宽字符逐个成块；连续的西文/数字/符号成块（也就是按词换行）
const CHUNK_RE = new RegExp(`[${CJK_RANGES}]|[^${CJK_RANGES}\\s]+`, 'g')

/** 把标题切成可整体换行的单元：中文一个字一个单元，西文一个词一个单元。 */
function toChunks(text) {
  const chunks = []
  for (const part of String(text).split(/(\s+)/)) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      chunks.push(part)
      continue
    }
    chunks.push(...(part.match(CHUNK_RE) ?? []))
  }
  return chunks
}

/** 按可用宽度把标题切成多行，超出上限时截断并加省略号。 */
function wrapTitle(title, fontSize, maxWidth, maxLines) {
  const lines = []
  let current = ''

  for (const chunk of toChunks(title)) {
    let pending = chunk

    // 单个词就超过一整行（长 URL 之类）时只能按字符硬切
    while (textWidth(pending, fontSize) > maxWidth) {
      if (current.trim()) {
        lines.push(current.trimEnd())
        current = ''
      }
      let cut = pending.length
      while (cut > 1 && textWidth(pending.slice(0, cut), fontSize) > maxWidth) cut--
      lines.push(pending.slice(0, cut))
      pending = pending.slice(cut)
    }

    const candidate = current + pending
    if (textWidth(candidate.trimEnd(), fontSize) > maxWidth && current.trim()) {
      lines.push(current.trimEnd())
      current = pending.trimStart()
    }
    else {
      current = candidate
    }
  }

  if (current.trim()) lines.push(current.trimEnd())

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1]
    while (last && textWidth(`${last}…`, fontSize) > maxWidth) last = last.slice(0, -1)
    kept[maxLines - 1] = `${last}…`
    return kept
  }

  return lines
}

/* ── 卡片绘制 ─────────────────────────────────────────────────────────── */

function buildOverlay({ title, date, tags }) {
  const maxWidth = WIDTH - PADDING * 2
  const titleSize = title.length > 26 ? 52 : 62
  const titleLines = wrapTitle(title, titleSize, maxWidth, 3)

  const lineHeight = titleSize * 1.32
  const metaSize = 26
  const metaGap = 22

  // 文字整体贴左下角，自下而上排布
  const metaBaseline = HEIGHT - PADDING - 6
  const lastTitleBaseline = metaBaseline - metaSize - metaGap
  const firstTitleBaseline = lastTitleBaseline - (titleLines.length - 1) * lineHeight

  const meta = [date, ...tags.map((t) => `#${t}`)].filter(Boolean).join('  ·  ')

  const titleSpans = titleLines
    .map((line, i) => `<tspan x="${PADDING}" y="${firstTitleBaseline + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('')

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.05"/>
      <stop offset="45%" stop-color="#000000" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.82"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scrim)"/>

  <text x="${PADDING}" y="${PADDING}" font-family="${FONT_STACK}" font-size="26" font-weight="700" fill="#ffffff" fill-opacity="0.75">${escapeXml(SITE_NAME)}</text>

  <text font-family="${FONT_STACK}" font-size="${titleSize}" font-weight="800" fill="#ffffff">${titleSpans}</text>

  ${meta ? `<text x="${PADDING}" y="${metaBaseline}" font-family="${FONT_STACK}" font-size="${metaSize}" fill="#ffffff" fill-opacity="0.8">${escapeXml(meta)}</text>` : ''}
</svg>`)
}

/** 没有可用图片时的兜底背景 */
function fallbackBackground() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="55%" stop-color="#16213e"/>
      <stop offset="100%" stop-color="#0f3460"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
</svg>`)
}

/* ── 取图 ─────────────────────────────────────────────────────────────── */

const IMAGE_PATTERNS = [
  /!\[[^\]]*\]\((\S+?)[\s)]/, // markdown: ![alt](src)
  /<img[^>]*\ssrc=["']([^"']+)["']/i, // html: <img src="...">
]

/**
 * 正文第一张图。相对路径指向仓库内的附件目录
 * （`./attachments/x.png` → `src/content/posts/attachments/x.png`），
 * 线上那份是 Astro 处理后的哈希文件名，没法从源码反推，所以本地读文件更可靠。
 */
function pickBackgroundImage(frontmatterImage, body) {
  if (/^https?:\/\//i.test(frontmatterImage ?? '')) return { kind: 'remote', src: frontmatterImage }

  for (const pattern of IMAGE_PATTERNS) {
    const found = body.match(pattern)
    if (!found) continue

    const src = found[1].trim()
    if (!src || src.startsWith('data:')) continue
    if (/^https?:\/\//i.test(src)) return { kind: 'remote', src }
    if (src.startsWith('//')) return { kind: 'remote', src: `https:${src}` }
    if (src.startsWith('/')) return { kind: 'remote', src: `${SITE_URL}${src}` }

    return { kind: 'local', src: join(POSTS_DIR, src.replace(/^\.\//, '')) }
  }

  return null
}

async function loadImage(image) {
  if (image.kind === 'local') {
    if (!existsSync(image.src)) throw new Error(`本地图片不存在：${image.src}`)
    return readFile(image.src)
  }

  const res = await fetch(image.src, { signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 1024) throw new Error('图片过小，可能不是有效图片')
  return buffer
}

/* ── 主流程 ───────────────────────────────────────────────────────────── */

/** 渲染卡片：图片铺底（可选）+ 文字层。图片不可用时自动回退纯色背景。 */
async function renderCard({ title, date, tags, image }) {
  let background = null

  if (image) {
    try {
      background = await sharp(await loadImage(image))
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
        .toBuffer()
    }
    catch (e) {
      console.warn(`      底图不可用（${e.message}），改用纯色背景`)
    }
  }

  // 输出 JPEG：照片底图用 PNG 会到 1.4MB 级别，JPEG 只要 100KB 上下
  return sharp(background ?? fallbackBackground())
    .composite([{ input: buildOverlay({ title, date, tags }) }])
    .jpeg({ quality: 85, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const files = (await readdir(POSTS_DIR)).filter((f) => /\.mdx?$/.test(f))

  let generated = 0
  let skippedExisting = 0
  let skippedCustomCover = 0
  const failures = []
  /** 本次构建应该存在的卡片文件名，用于识别失效的旧卡片 */
  const kept = new Set()

  console.log('OG 卡片生成')

  for (const file of files) {
    const source = join(POSTS_DIR, file)
    const { data, content } = matter(await readFile(source, 'utf-8'))

    if (data.draft || data.redirect) continue

    // 必须和 Astro 的 entry.slug 一致：它用 github-slugger 处理文件名
    // （小写化、去标点、空格转连字符）。否则页面引用的 /og/<slug>.jpg 会 404。
    const slug = data.customSlug || githubSlug(file.replace(/\.mdx?$/, ''))
    if (ONLY && slug !== ONLY) continue

    // 作者手工设计过封面：那张图通常已经带标题，直接用，不再叠字
    if (/^https?:\/\//i.test(data.image ?? '')) {
      skippedCustomCover++
      continue
    }

    const outPath = join(OUT_DIR, `${slug}.jpg`)
    kept.add(`${slug}.jpg`)
    if (!FORCE && existsSync(outPath)) {
      const [outStat, srcStat] = await Promise.all([stat(outPath), stat(source)])
      if (outStat.mtimeMs > srcStat.mtimeMs) {
        skippedExisting++
        continue
      }
    }

    const title = data.title || slug
    const date = formatDate(data.date)
    const tags = (data.tags ?? []).slice(0, 3)
    const image = pickBackgroundImage(data.image, content)

    try {
      const png = await renderCard({ title, date, tags, image })
      await writeFile(outPath, png)
      generated++
      if (ONLY || generated % 25 === 0) console.log(`  已生成 ${generated} 张…`)
    }
    catch (e) {
      failures.push(`${slug}: ${e.message}`)
    }
  }

  // 站点默认图：首页、列表页等
  try {
    const png = await renderCard({
      title: SITE_NAME,
      date: SITE_TAGLINE,
      tags: [],
      image: null,
    })
    await writeFile(SITE_OG, png)
    console.log('  已生成站点默认图 public/og.jpg')
  }
  catch (e) {
    failures.push(`og.jpg: ${e.message}`)
  }

  // 文章改名或被删掉后，旧卡片不会再有页面引用，清掉免得跟着部署上去
  let removed = 0
  if (!ONLY) {
    const expected = new Set([...kept, 'og.jpg'])
    for (const name of await readdir(OUT_DIR)) {
      if (!name.endsWith('.jpg') || expected.has(name)) continue
      await rm(join(OUT_DIR, name))
      removed++
    }
  }

  console.log(
    `\n完成：生成 ${generated} 张，跳过 ${skippedExisting} 张（未变更），`
    + `${skippedCustomCover} 张沿用作者封面`
    + (removed ? `，清理 ${removed} 张失效卡片` : ''),
  )

  if (failures.length) {
    console.error(`\n以下 ${failures.length} 项失败：`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exitCode = 1
  }
}

await main()
