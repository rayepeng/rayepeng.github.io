import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '/Users/raye/code/antfu.me/pages/posts'
const DST = '/Users/raye/code/astrofu/src/content/posts'

// Ensure DST exists
if (!existsSync(DST)) mkdirSync(DST, { recursive: true })

const files = readdirSync(SRC).filter(f => f.endsWith('.md'))
let copied = 0
let skipped = 0
let needsManualEdit = []

for (const file of files) {
  const srcPath = join(SRC, file)
  const dstPath = join(DST, file)

  // Skip if already exists (our sample posts)
  if (existsSync(dstPath)) {
    skipped++
    continue
  }

  let content = readFileSync(srcPath, 'utf-8')

  // Flag files with <script setup> for manual conversion
  if (content.includes('<script setup')) {
    needsManualEdit.push(file)
  }

  writeFileSync(dstPath, content, 'utf-8')
  copied++
}

console.log(`Copied: ${copied}`)
console.log(`Skipped (already exist): ${skipped}`)
console.log(`Need manual .mdx conversion: ${needsManualEdit.length}`)
console.log(`Files: ${needsManualEdit.join(', ')}`)
