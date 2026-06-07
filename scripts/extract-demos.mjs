/**
 * Extract demo metadata from antfu.me/demo into a static JSON file
 * Run: node scripts/extract-demos.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '/Users/raye/code/antfu.me/demo'
const DST = '/Users/raye/code/astrofu/src/data/demos.json'

const result = []

const files = readdirSync(SRC).filter(f => f.endsWith('.md'))

for (const file of files) {
  const date = file.replace('.md', '')
  const content = readFileSync(join(SRC, file), 'utf-8')

  // Parse frontmatter
  let link = ''
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (fmMatch) {
    const linkMatch = fmMatch[1].match(/^link:\s*(.+)$/m)
    if (linkMatch) link = linkMatch[1].trim()
  }

  // Get description (everything after frontmatter)
  const desc = content.replace(/^---\n[\s\S]*?\n---\n*/, '').trim()

  // Check for video file
  const videoUrl = `/demo/${date}.mp4`
  const hasVideo = existsSync(join(SRC, `${date}.mp4`))

  result.push({
    date,
    link,
    description: desc,
    video: hasVideo ? videoUrl : '',
  })
}

// Sort by date descending
result.sort((a, b) => b.date.localeCompare(a.date))

writeFileSync(DST, JSON.stringify(result, null, 2), 'utf8')
console.log(`Extracted ${result.length} demos to ${DST}`)
