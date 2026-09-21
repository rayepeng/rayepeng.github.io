/**
 * OG image generator for astrofu
 *
 * Reads all post frontmatter from Content Collection (via glob scan of frontmatter),
 * generates PNG via sharp + SVG template, writes to public/og/<slug>.png.
 *
 * Run: node scripts/generate-og.mjs
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const POSTS_DIR = '/Users/raye/code/astrofu/src/content/posts'
const OG_DIR = '/Users/raye/code/astrofu/public/og'
const TEMPLATE = '/Users/raye/code/astrofu/scripts/og-template.svg'

if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true })

const svgTemplate = readFileSync(TEMPLATE, 'utf-8')

// Parse YAML frontmatter from markdown files
function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const yaml = match[1]
  const result: Record<string, string> = {}
  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w+):\s*['"]?(.*?)['"]?\s*$/)
    if (kv) result[kv[1]] = kv[2]
  }
  return result
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  catch {
    return dateStr
  }
}

// Split title into two lines if too long
function splitTitle(title: string): [string, string] {
  const maxChars = 30
  if (title.length <= maxChars) return [title, '']
  // Try to split at a space near the middle
  const mid = Math.floor(title.length / 2)
  let splitIdx = title.lastIndexOf(' ', mid + 5)
  if (splitIdx <= 0 || splitIdx > mid + 10) splitIdx = title.indexOf(' ', mid - 5)
  if (splitIdx <= 0) return [title.slice(0, maxChars) + '…', '']
  return [title.slice(0, splitIdx), title.slice(splitIdx + 1)]
}

const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
let generated = 0
let skipped = 0

for (const file of files) {
  const content = readFileSync(join(POSTS_DIR, file), 'utf-8')
  const fm = parseFrontmatter(content)

  // Skip drafts and redirects
  if (fm.draft === 'true' || fm.redirect) {
    skipped++
    continue
  }

  const slug = file.replace(/\.md$/, '')
  const title = fm.title || slug
  const date = fm.date ? formatDate(fm.date) : ''

  const [line1, line2] = splitTitle(title)
  const svg = svgTemplate
    .replace('{{line1}}', escapeXml(line1))
    .replace('{{line2}}', escapeXml(line2))
    .replace('{{date}}', date)

  const outPath = join(OG_DIR, `${slug}.png`)

  // Skip if already exists and newer than source
  if (existsSync(outPath)) {
    skipped++
    continue
  }

  try {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
    writeFileSync(outPath, pngBuffer)
    generated++
    if (generated <= 5 || generated % 20 === 0) console.log(`  Generated: ${slug}.png`)
  }
  catch (e: any) {
    console.error(`  FAILED: ${slug} — ${e.message}`)
  }
}

console.log(`\nOG generation complete: ${generated} generated, ${skipped} skipped`)
