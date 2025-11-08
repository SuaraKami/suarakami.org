import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const indexCollection = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/index' }),
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
    events: z.array(z.object({
      title: z.string(),
      description: z.string(),
      when: z.string(),
    })),
  }),
})

export const collections = {
  index: indexCollection,
}
