import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site ?? 'https://rayepeng.net').toString()
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
