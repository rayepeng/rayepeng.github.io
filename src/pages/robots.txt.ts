import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const body = `User-agent: *
Allow: /

Sitemap: https://antfu.me/sitemap-index.xml
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
