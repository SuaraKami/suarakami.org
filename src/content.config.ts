import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const indexCollection = defineCollection({
  loader: glob({ pattern: '**/index.yml', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      time: z.string(),
      location: z.string(),
      link: z.object({
        label: z.string(),
        to: z.string(),
        target: z.string(),
      }),
    }),
    about: z.string(),
  }),
})

const eventCollection = defineCollection({
  loader: glob({ pattern: '*/events/*.md', base: './src/content' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    photos: z.array(z.object({
      img: image(),
      caption: z.string().optional(),
    })).optional(),
  }),
})

export const collections = {
  index: indexCollection,
  event: eventCollection,
}
