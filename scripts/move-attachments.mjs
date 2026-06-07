import fs from 'node:fs/promises'
import path from 'node:path'

const POSTS = '/Users/raye/code/astrofu/src/content/posts'

// Move weekpost/attachments → attachments
const src = path.join(POSTS, 'weekpost', 'attachments')
const dst = path.join(POSTS, 'attachments')

try {
  await fs.cp(src, dst, { recursive: true })
  console.log('Copied weekpost/attachments → attachments/')
  await fs.rm(path.join(POSTS, 'weekpost'), { recursive: true })
  console.log('Removed weekpost/')
} catch (e) {
  console.log('weekpost/attachments not found or already moved:', e.message)
}

// Remove empty guide/
try {
  await fs.rmdir(path.join(POSTS, 'guide'))
  console.log('Removed empty guide/')
} catch {
  console.log('guide/ not empty or not found')
}

// Verify
const entries = await fs.readdir(POSTS, { withFileTypes: true })
console.log('Dirs:', entries.filter(e => e.isDirectory()).map(e => e.name).join(', ') || 'none')
console.log('Files:', entries.filter(e => e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx'))).length)
