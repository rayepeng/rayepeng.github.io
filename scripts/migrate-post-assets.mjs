import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const PAIRS = [
  ['/Users/raye/code/antfu.me/pages/posts/ai-qrcode.png', '/Users/raye/code/astrofu/public/posts/ai-qrcode.png'],
  ['/Users/raye/code/antfu.me/pages/posts/ai-qrcode-101.png', '/Users/raye/code/astrofu/public/posts/ai-qrcode-101.png'],
  ['/Users/raye/code/antfu.me/pages/posts/ai-qrcode-refine.png', '/Users/raye/code/astrofu/public/posts/ai-qrcode-refine.png'],
]

for (const [src, dst] of PAIRS) {
  const dir = join(dst, '..')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(dst, readFileSync(src))
  console.log(`Copied: ${dst}`)
}
