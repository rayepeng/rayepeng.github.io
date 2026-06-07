import fs from 'node:fs/promises'
import path from 'node:path'

const POSTS = '/Users/raye/code/astrofu/src/content/posts'
const IMPORTED = path.join(POSTS, 'imported')

// 1. Move each subfolder of imported/ up to posts/
const subdirs = await fs.readdir(IMPORTED, { withFileTypes: true })
for (const d of subdirs) {
  if (!d.isDirectory()) continue
  const src = path.join(IMPORTED, d.name)
  const dst = path.join(POSTS, d.name)
  // If dst already exists, merge
  try {
    await fs.access(dst)
    // Merge: copy files from src into dst recursively
    const entries = await fs.readdir(src, { withFileTypes: true })
    for (const e of entries) {
      const eSrc = path.join(src, e.name)
      const eDst = path.join(dst, e.name)
      if (e.isDirectory()) {
        await fs.cp(eSrc, eDst, { recursive: true })
      } else {
        await fs.copyFile(eSrc, eDst)
      }
    }
    await fs.rm(src, { recursive: true })
    console.log(`Merged ${d.name}/`)
  } catch {
    // dst doesn't exist, just rename
    await fs.rename(src, dst)
    console.log(`Moved ${d.name}/`)
  }
}

// 2. Check for any leftover md files in imported/ root
const leftovers = (await fs.readdir(IMPORTED)).filter(f => f.endsWith('.md'))
if (leftovers.length) {
  console.warn('Orphan md files in imported/:', leftovers)
} else {
  await fs.rmdir(IMPORTED)
  console.log('Removed empty imported/ folder')
}

// 3. Verify
const final = await fs.readdir(POSTS, { withFileTypes: true })
console.log('Posts root:', final.filter(d => d.isDirectory()).map(d => d.name).join(', '))
