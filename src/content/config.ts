import { defineCollection, z } from 'astro:content'

const docs = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      tags: z.array(z.string()),
      created: z.date(),
      updated: z.date(),
      hero: image().optional(),
      history: z
        .array(
          z.object({
            author: z.string(),
            date: z.date(),
            message: z.string(),
            hash: z.string(),
          }),
        )
        .default([]),
    }),
})

export const collections = { docs }
