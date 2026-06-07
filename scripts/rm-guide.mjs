import fs from 'node:fs/promises'
import path from 'node:path'

const POSTS = '/Users/raye/code/astrofu/src/content/posts'
const guideDir = path.join(POSTS, 'guide')

// Move any remaining files in guide/ to posts root
const entries = await fs.readdir(guideDir)
for (const e of entries) {
  const src = path.join(guideDir, e)
  const dst = path.join(POSTS, `guide-${e}`)
  await fs.rename(src, dst)
  console.log(`Moved guide/${e} → guide-${e}`)
}
await fs.rmdir(guideDir)
console.log('Removed guide/')
