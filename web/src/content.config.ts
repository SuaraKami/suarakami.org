import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const indexCollection = defineCollection({
  loader: glob({ base: './src/content', pattern: '**/index.yaml' }),
  schema: z.object({
    about: z.string(),
    description: z.string(),
    hero: z.object({
      date: z.coerce.date().nullish(),
      description: z.string(),
      link: z.object({
        label: z.string(),
        target: z.string(),
        to: z.string(),
      }),
      location: z.string().optional(),
      title: z.string(),
    }),
    title: z.string(),
  }),
})

const eventCollection = defineCollection({
  loader: glob({ base: './src/content', pattern: '*/events/*.md' }),
  schema: z.object({
    dates: z.array(z.coerce.date()).min(1).max(2),
    description: z.string(),
    featured: z.boolean().default(false),
    link: z
      .object({
        label: z.string().optional(),
        target: z.string().optional().default('_blank'),
        to: z.string(),
      })
      .or(z.string())
      .optional(),
    location: z.string().optional(),
    title: z.string(),
  }),
})

export const collections = {
  event: eventCollection,
  index: indexCollection,
}
