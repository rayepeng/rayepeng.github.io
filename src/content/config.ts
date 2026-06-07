import { defineCollection, z } from 'astro:content'

/* ─── posts ─────────────────────────────────────────────────────────── */

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
    // antfu.me posts may carry `type: note` (multi-typed via "blog+note")
    type: z.string().optional().default('blog'),
    redirect: z.string().optional().default(''),
    // rayepeng imported posts
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().default(''),
    updated: z.union([z.string(), z.date()]).optional(),
    customSlug: z.string().optional().default(''),
  }),
})

/* ─── talks ─────────────────────────────────────────────────────────── */

const talkPresentation = z.object({
  lang: z.string().optional(),
  date: z.union([z.string(), z.date()]).transform((v) =>
    typeof v === 'string' ? v : v.toISOString(),
  ),
  location: z.string().optional(),
  conference: z.string(),
  conferenceUrl: z.string().optional(),
  recording: z.string().optional(),
  transcript: z.string().optional(),
  pdf: z.string().optional(),
  spa: z.string().optional(),
})

const talksCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    series: z.string().optional(),
    lang: z.string().optional(),
    presentations: z.array(talkPresentation),
  }),
})

/* ─── podcasts ──────────────────────────────────────────────────────── */

const podcastsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]).transform((v) =>
      typeof v === 'string' ? v : v.toISOString(),
    ),
    path: z.string(),
    lang: z.string().optional(),
    radio: z.boolean().optional(),
    video: z.boolean().optional(),
  }),
})

/* ─── media (anime / book / movie / drama / game / song) ────────────── */

const mediaRecord = z.object({
  name: z.string(),
  creator: z.string().optional(),
  state: z.enum(['done', 'doing', 'todo']).optional(),
  date: z.string().optional(),
  note: z.string().optional(),
  lang: z.string().optional(),
})

const mediaCollection = defineCollection({
  type: 'data',
  schema: z.object({
    type: z.enum(['anime', 'book', 'movie', 'drama', 'game', 'song']),
    items: z.array(mediaRecord),
  }),
})

/* ─── projects ──────────────────────────────────────────────────────── */

const projectItem = z.object({
  name: z.string(),
  link: z.string(),
  desc: z.string().optional(),
  icon: z.string().optional(),
})

const projectsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // groups: { 'Current Focus': [...], 'Nuxt Ecosystem': [...] }
    groups: z.record(z.array(projectItem)),
  }),
})

export const collections = {
  posts: postsCollection,
  talks: talksCollection,
  podcasts: podcastsCollection,
  media: mediaCollection,
  projects: projectsCollection,
}