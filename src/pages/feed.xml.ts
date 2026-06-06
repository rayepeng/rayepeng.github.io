import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { rss } from '@vueuse/shared'

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('posts', ({ data }) => !data.draft && !data.redirect)
  const sorted = posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Anthony Fu's Blog</title>
  <subtitle>Anthony Fu's Blog — Web Dev, Open Source, Photography</subtitle>
  <link href="${context.site}feed.xml" rel="self"/>
  <link href="${context.site}" rel="alternate"/>
  <id>${context.site}</id>
  <updated>${sorted[0]?.data.date ? new Date(sorted[0].data.date).toISOString() : new Date().toISOString()}</updated>
  ${sorted.slice(0, 25).map((post) => `
  <entry>
    <title><![CDATA[${post.data.title}]]></title>
    <link href="${context.site}posts/${post.slug}"/>
    <id>${context.site}posts/${post.slug}</id>
    <updated>${post.data.date ? new Date(post.data.date).toISOString() : ''}</updated>
    <summary><![CDATA[${post.data.description || ''}]]></summary>
  </entry>`).join('')}
</feed>`,
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  )
}
