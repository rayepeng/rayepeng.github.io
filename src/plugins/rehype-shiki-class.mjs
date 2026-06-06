/**
 * Rename Astro's default `astro-code` class on <pre> blocks to `shiki`,
 * so that styles from antfu.me's markdown.css (all targeted at `.shiki`)
 * apply correctly. Also strips inline `style` attributes (background/color)
 * so our CSS variables take over.
 *
 * Runs after Shiki has highlighted the tree, so we re-write classes in-place.
 */
import { visit } from 'unist-util-visit'

export default function rehypeShikiClass() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') return
      const classes = (node.properties?.className ?? []).filter(
        (c) => c !== 'astro-code',
      )
      if (!classes.includes('shiki')) classes.unshift('shiki')
      node.properties.className = classes
      // remove inline background-color set by shiki (we use --c-bg from CSS)
      if (node.properties.style) {
        node.properties.style = String(node.properties.style)
          .split(';')
          .filter((s) => !/^\s*background[-a-z]*\s*:/.test(s))
          .filter((s) => !/^\s*color\s*:/.test(s))
          .join(';')
        if (!node.properties.style.trim()) delete node.properties.style
      }
    })
  }
}