import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'

const RENAMES = [
  ['reimagine-atomic-css', true],      // needs .mdx for import
  ['reimagine-atomic-css-zh', true],   // needs .mdx for import
  ['rewrite-in-vite', false],           // just text mention, keep .md
  ['composable-vue-vueday-2021', false], // just text mention, keep .md
  ['journey-with-icons-continues', false], // uses icon class, keep .md
  ['async-with-composition-api', false],  // just text mention, keep .md
  ['binfe-2020-zh', false],              // just text mention, keep .md
]

const DIR = '/Users/raye/code/astrofu/src/content/posts'

for (const [slug, needsMdx] of RENAMES) {
  const mdPath = `${DIR}/${slug}.md`
  const mdxPath = `${DIR}/${slug}.mdx`

  if (needsMdx && existsSync(mdPath) && !existsSync(mdxPath)) {
    const content = readFileSync(mdPath, 'utf-8')
    writeFileSync(mdxPath, content, 'utf-8')
    unlinkSync(mdPath)
    console.log(`Renamed: ${slug}.md → ${slug}.mdx`)
  } else if (needsMdx && existsSync(mdxPath)) {
    console.log(`Already .mdx: ${slug}`)
  } else {
    console.log(`Keep .md: ${slug}`)
  }
}
