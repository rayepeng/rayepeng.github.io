/**
 * Migrate Markdown blog posts and attachments from rayepeng.github.io to astrofu.
 *
 * Source: /Users/raye/code/rayepeng.github.io/src/content/posts
 * Target: /Users/raye/code/astrofu/src/content/posts/imported
 *
 * Steps per file:
 *   - Copy .md to imported/<relative-path>
 *   - Transform frontmatter:
 *       published (Date)   -> date (ISO string)
 *       updated, tags, category, customSlug -> kept as-is (optional fields are tolerated by the schema)
 *       prev/nextTitle/Slug -> stripped (runtime-only fields)
 *   - Image paths (./attachments/xxx) remain valid because we copy attachments alongside.
 *
 * Run: node scripts/migrate-blog-posts.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const SRC = '/Users/raye/code/rayepeng.github.io/src/content/posts'
const DST = '/Users/raye/code/astrofu/src/content/posts/imported'

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

function transformFrontmatter(raw) {
  // raw: full file content
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { content: raw, changed: false }

  const lines = m[1].split('\n')
  const out = []
  const drop = new Set(['prevTitle', 'prevSlug', 'nextTitle', 'nextSlug'])
  let renamed = false

  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (!kv) {
      out.push(line)
      continue
    }
    const [, key, value] = kv
    if (drop.has(key)) continue

    if (key === 'published') {
      // YAML date 2023-12-06 -> astrofu accepts both Date and string; keep as-is but rename to `date`.
      out.push(`date: ${value}`)
      renamed = true
      continue
    }
    out.push(line)
  }

  return {
    content: `---\n${out.join('\n')}\n---\n${m[2]}`,
    changed: renamed,
  }
}

async function copyFile(src, dst) {
  await fs.mkdir(path.dirname(dst), { recursive: true })
  if (src.endsWith('.md')) {
    const raw = await fs.readFile(src, 'utf8')
    const { content } = transformFrontmatter(raw)
    await fs.writeFile(dst, content)
  } else {
    await fs.copyFile(src, dst)
  }
}

async function main() {
  console.log(`Scanning ${SRC} ...`)
  const files = await walk(SRC)
  const md = files.filter((f) => f.endsWith('.md'))
  const assets = files.filter((f) => !f.endsWith('.md'))

  console.log(`Found ${md.length} markdown files, ${assets.length} assets`)
  console.log(`Target: ${DST}`)
  await fs.mkdir(DST, { recursive: true })

  let ok = 0
  for (const f of files) {
    const rel = path.relative(SRC, f)
    const dst = path.join(DST, rel)
    try {
      await copyFile(f, dst)
      ok++
    } catch (err) {
      console.error(`FAIL ${rel}:`, err.message)
    }
  }
  console.log(`Done: ${ok}/${files.length} files copied`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
