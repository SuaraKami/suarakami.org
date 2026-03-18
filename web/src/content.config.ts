import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const indexCollection = defineCollection({
  loader: glob({ base: './src/content', pattern: '**/index.yml' }),
  schema: z.object({
    about: z.string(),
    description: z.string(),
    hero: z.object({
      date: z.coerce.date().optional(),
      description: z.string(),
      link: z.object({
        label: z.string(),
        target: z.string(),
        to: z.string(),
      }),
      location: z.string().optional(),
      time: z.string().optional(),
      title: z.string(),
    }),
    title: z.string(),
  }),
})

const eventCollection = defineCollection({
  loader: glob({ base: './src/content', pattern: '*/events/*.md' }),
  schema: ({ image }) =>
    z.object({
      dates: z.array(z.coerce.date()).min(1).max(2),
      description: z.string(),
      photos: z
        .array(
          z.object({
            caption: z.string().optional(),
            img: image(),
          })
        )
        .optional(),
      title: z.string(),
    }),
})

export const collections = {
  event: eventCollection,
  index: indexCollection,
}
