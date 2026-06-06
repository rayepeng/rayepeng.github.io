import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '/Users/raye/code/antfu.me/pages/posts'
const DST = '/Users/raye/code/astrofu/src/content/posts'

if (!existsSync(DST)) mkdirSync(DST, { recursive: true })

const files = readdirSync(SRC).filter(f => f.endsWith('.md'))
let copied = 0, skipped = 0, needsEdit = []

for (const file of files) {
  const dstPath = join(DST, file)
  if (existsSync(dstPath)) { skipped++; continue }

  const content = readFileSync(join(SRC, file), 'utf-8')
  if (content.includes('<script setup')) needsEdit.push(file)

  try {
    writeFileSync(dstPath, content, 'utf-8')
    copied++
  } catch (e) {
    console.error(`FAILED: ${file} — ${e.code}`)
  }
}

console.log(`Copied: ${copied}, Skipped: ${skipped}, Failed: ${files.length - copied - skipped}`)
console.log(`Needs .mdx conversion: [${needsEdit.join(', ')}]`)
