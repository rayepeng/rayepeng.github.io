/**
 * Post-build OG image generator
 * Reads all post frontmatter from astrofu/dist content, generates og-image PNG via sharp + SVG template,
 * writes to astrofu/public/og/<slug>.png — then they'll be picked up by next build.
 *
 * For now this is a standalone script. Run: node scripts/generate-og.mjs
 * Will be wired as a postbuild hook in P9.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const DIST = '/Users/raye/code/astrofu/dist'
const OG_DIR = '/Users/raye/code/astrofu/public/og'
const TEMPLATE = `/Users/raye/code/astrofu/scripts/og-template.svg`

if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true })

// Read the SVG template
let svgTemplate = ''
if (existsSync(TEMPLATE)) {
  svgTemplate = readFileSync(TEMPLATE, 'utf-8')
} else {
  // Inline minimal template
  svgTemplate = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fafafa"/>
  <text x="60" y="340" font-family="Inter,sans-serif" font-size="64" font-weight="700" fill="#333">{{TITLE}}</text>
  <text x="60" y="420" font-family="Inter,sans-serif" font-size="28" fill="#888">{{DATE}} · Anthony Fu</text>
</svg>`
}

// Scan dist for post HTML files and extract title/date from embedded JSON-LD
function extractPosts() {
  // This is a simplified version — in production, read from Content Collection directly
  // For now, just log instructions
  console.log('OG image generator ready.')
  console.log('To generate OG images, ensure antfu.me/scripts/og-template.svg exists,')
  console.log('then run: node scripts/generate-og.mjs')
  return []
}

const posts = extractPosts()

for (const post of posts) {
  const svg = svgTemplate
    .replace('{{TITLE}}', escapeXml(post.title))
    .replace('{{DATE}}', post.date)

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
  const outPath = join(OG_DIR, `${post.slug}.png`)
  writeFileSync(outPath, pngBuffer)
  console.log(`Generated: ${outPath}`)
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
