import { file } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const links = defineCollection({
  loader: file('src/content/links.yml'),
  schema: z.object({
    description: z.string().optional(),
    featured: z.boolean().default(false),
    icon: z.string().optional(),
    title: z.string(),
    url: z.url(),
  }),
})

export const collections = { links }
