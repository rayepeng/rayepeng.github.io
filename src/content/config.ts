import { defineCollection, z } from 'astro:content'

const postsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    // YAML auto-parses ISO dates → Date; accept either form, then normalize at use sites.
    date: z.union([z.string(), z.date()]).transform((v) =>
      typeof v === 'string' ? v : v.toISOString(),
    ),
    lang: z.string().optional().default('en'),
    duration: z.string().optional().default(''),
    description: z.string().optional().default(''),
    image: z.string().optional().default(''),
    draft: z.boolean().optional().default(false),
    type: z.string().optional().default(''),
    redirect: z.string().optional().default(''),
  }),
})

export const collections = {
  posts: postsCollection,
}