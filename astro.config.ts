import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import mdx from '@astrojs/mdx'
import UnoCSS from '@unocss/astro'

import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGithubAlerts from 'remark-github-alerts'
import rehypeShikiClass from './src/plugins/rehype-shiki-class.mjs'

import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'

// https://astro.build/config
export default defineConfig({
  site: 'https://antfu.me',
  trailingSlash: 'never',
  integrations: [
    UnoCSS({ injectReset: true }),
    vue({ appEntrypoint: '/src/vue-app-entrypoint.ts' }),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
      cssVariablePrefix: '--s-',
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
      ],
    },
    remarkPlugins: [
      remarkGithubAlerts,
    ],
    rehypePlugins: [
      // Rename Astro's `astro-code` to `.shiki` so antfu.me's markdown.css applies.
      rehypeShikiClass,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          // Append a discreet `#` after each heading, matching antfu.me.
          behavior: 'append',
          properties: { className: ['header-anchor'], ariaHidden: 'true', tabIndex: -1 },
          content: { type: 'text', value: '#' },
        },
      ],
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['noopener', 'noreferrer'] },
      ],
    ],
  },
  vite: {
    ssr: {
      noExternal: ['floating-vue', 'shiki-magic-move'],
    },
  },
})