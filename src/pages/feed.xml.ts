import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import type { APIContext } from 'astro'

const parser = new MarkdownIt()

function stripInvalidXmlChars(str: string): string {
  return str.replace(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
    '',
  )
}

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => !data.draft && !data.redirect)
  const sorted = posts.sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date))

  return rss({
    title: "Raye's Journey",
    description: "Raye's Journey — 无人调护，自去经心",
    site: context.site ?? 'https://rayepeng.github.io/',
    items: sorted.map((post) => {
      let content = typeof post.body === 'string' ? post.body : String(post.body || '')
      // Strip MDX import/export lines so markdown-it doesn't render them as text
      content = content.replace(/^(import|export)\s.+$/gm, '')
      const cleanedContent = stripInvalidXmlChars(content)
      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: post.data.description || '',
        link: `/posts/${(post.data as any).customSlug || post.slug}/`,
        content: sanitizeHtml(parser.render(cleanedContent), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }),
      }
    }),
    customData: '<language>zh_CN</language>',
  })
}
