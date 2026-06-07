import fs from 'node:fs/promises'
import path from 'node:path'

const dir = '/Users/raye/code/astrofu/src/content/posts/imported'
const badDir = path.join(dir, "'")
const targetDir = path.join(dir, '未分类')

await fs.mkdir(targetDir, { recursive: true })

const files = await fs.readdir(badDir)
console.log('Moving files from quote folder:', files)
for (const f of files) {
  await fs.rename(path.join(badDir, f), path.join(targetDir, f))
}
await fs.rmdir(badDir)
console.log('Done. Quote folder removed.')
