import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import UnoCSS from '@unocss/astro'

import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGithubAlerts from 'remark-github-alerts'

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
    // sitemap() — re-enable in P9 once we have real pages
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
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: { className: ['anchor'], ariaHidden: 'true' },
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