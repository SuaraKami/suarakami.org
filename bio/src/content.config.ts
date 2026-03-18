import { file } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const links = defineCollection({
  loader: file('src/content/links.yml'),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string().url(),
    icon: z.string().optional(),
    featured: z.boolean().default(false),
  }),
})

export const collections = { links }
