/**
 * Reorganize imported markdown files by category and remove antfu posts.
 *
 * 1. Delete all *.md directly under src/content/posts/ (antfu's posts)
 * 2. Keep only imported/ directory
 * 3. Move imported/*.md files into category subfolders based on frontmatter `category`
 * 4. weekpost/ subfolder stays as-is (already categorized internally)
 *
 * Run: node scripts/reorganize-posts.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const POSTS = '/Users/raye/code/astrofu/src/content/posts'

// Category → folder mapping (empty/missing category → '未分类')
async function getCategories() {
  const importedRoot = path.join(POSTS, 'imported')
  const rootMdFiles = (await fs.readdir(importedRoot))
    .filter(f => f.endsWith('.md'))

  const catMap = {} // category → [filename]
  for (const f of rootMdFiles) {
    const content = await fs.readFile(path.join(importedRoot, f), 'utf8')
    const m = content.match(/^---\n([\s\S]*?)\n---/)
    let cat = '未分类'
    if (m) {
      const cm = m[1].match(/^category:\s*['"]?(.+?)['"]?\s*$/m)
      if (cm && cm[1].trim()) cat = cm[1].trim()
    }
    if (!catMap[cat]) catMap[cat] = []
    catMap[cat].push(f)
  }
  return catMap
}

async function main() {
  // Step 1: Delete antfu's markdown files from posts root
  const rootFiles = await fs.readdir(POSTS)
  const antfuMd = rootFiles.filter(f => f.endsWith('.md'))
  console.log(`Deleting ${antfuMd.length} antfu markdown files...`)
  for (const f of antfuMd) {
    await fs.unlink(path.join(POSTS, f))
  }

  // Step 2: Organize imported root md files into category folders
  const catMap = await getCategories()
  const importedRoot = path.join(POSTS, 'imported')

  for (const [cat, files] of Object.entries(catMap)) {
    const catDir = path.join(importedRoot, cat)
    await fs.mkdir(catDir, { recursive: true })
    console.log(`Moving ${files.length} files → ${cat}/`)
    for (const f of files) {
      const src = path.join(importedRoot, f)
      const dst = path.join(catDir, f)
      await fs.rename(src, dst)
    }
  }

  // Step 3: Verify
  const remaining = (await fs.readdir(importedRoot)).filter(f => f.endsWith('.md'))
  if (remaining.length > 0) {
    console.warn(`Warning: ${remaining.length} orphan md files remain at imported root:`, remaining)
  } else {
    console.log('All root-level md files have been categorized.')
  }

  // List final structure
  const dirs = (await fs.readdir(importedRoot, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
  console.log('Final category folders:', dirs.join(', '))
}

main().catch(e => { console.error(e); process.exit(1) })
