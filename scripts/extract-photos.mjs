/**
 * Extract photo metadata from antfu.me/photos into a static JSON file
 * for Astro to consume without Vite's import.meta.glob
 *
 * Run: node scripts/extract-photos.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const SRC = '/Users/raye/code/antfu.me/photos'
const DST = '/Users/raye/code/astrofu/src/data/photos.json'

const result = []

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      walk(full)
    } else if (e.isFile()) {
      const ext = extname(e.name).toLowerCase()
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const relPath = relative(SRC, full)
        const jsonPath = full.replace(/\.\w+$/, '.json')
        let meta = {}
        if (existsSync(jsonPath)) {
          meta = JSON.parse(readFileSync(jsonPath, 'utf8'))
        }
        result.push({
          name: relPath,
          url: `/photos/${relPath}`,
          ...meta,
        })
      }
    }
  }
}

walk(SRC)
writeFileSync(DST, JSON.stringify(result, null, 2), 'utf8')
console.log(`Extracted ${result.length} photos to ${DST}`)
