import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = '/Users/raye/code/antfu.me/public/images'
const DST = '/Users/raye/code/astrofu/public/images'

if (!existsSync(DST)) mkdirSync(DST, { recursive: true })

let copied = 0, skipped = 0

function copyDir(srcDir, dstDir) {
  if (!existsSync(dstDir)) mkdirSync(dstDir, { recursive: true })
  const entries = readdirSync(srcDir)
  for (const entry of entries) {
    const srcPath = join(srcDir, entry)
    const dstPath = join(dstDir, entry)
    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      copyDir(srcPath, dstPath)
    } else {
      if (existsSync(dstPath)) { skipped++; continue }
      writeFileSync(dstPath, readFileSync(srcPath))
      copied++
    }
  }
}

copyDir(SRC, DST)
console.log(`Images copied: ${copied}, skipped: ${skipped}`)
