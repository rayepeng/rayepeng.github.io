import fs from 'node:fs/promises'
import path from 'node:path'

const POSTS = '/Users/raye/code/astrofu/src/content/posts'

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...await collectFiles(full))
    } else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

const allFiles = await collectFiles(POSTS)
console.log(`Found ${allFiles.length} markdown files`)

// Track filenames to detect conflicts
const nameCounts = new Map()
for (const f of allFiles) {
  const base = path.basename(f)
  nameCounts.set(base, (nameCounts.get(base) ?? 0) + 1)
}

// Move files to posts root, prefix with folder name on conflict
for (const f of allFiles) {
  const base = path.basename(f)
  const targetName = nameCounts.get(base) > 1
    ? `${path.basename(path.dirname(f))}-${base}`
    : base
  const target = path.join(POSTS, targetName)
  if (f !== target) {
    await fs.rename(f, target)
  }
}

// Remove empty subdirectories
async function removeEmptyDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isDirectory()) continue
    const full = path.join(dir, e.name)
    await removeEmptyDirs(full)
    const remaining = await fs.readdir(full)
    if (remaining.length === 0) {
      await fs.rmdir(full)
      console.log(`Removed empty dir: ${e.name}/`)
    }
  }
}

await removeEmptyDirs(POSTS)

const final = (await fs.readdir(POSTS)).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
console.log(`Final: ${final.length} files in posts root`)
