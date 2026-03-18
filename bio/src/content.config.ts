import { file } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const links = defineCollection({
  loader: file('src/content/links.yml'),
  schema: z.object({
    description: z.string().optional(),
    featured: z.boolean().default(false),
    icon: z.string().optional(),
    title: z.string(),
    url: z.string().url(),
  }),
})

export const collections = { links }
