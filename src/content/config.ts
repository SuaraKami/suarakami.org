import { defineCollection, reference, z } from 'astro:content'

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
          }),
        )
        .default([]),
    }),
})

const glossary = defineCollection({
  type: 'data',
  schema: () =>
    z.object({
      term: z.string(),
      definition: z.string(),
      lang: z.string().default('EN'),
      pos: z.string(),
      aliases: z.array(z.string()).default([]),
      relations: z
        .array(
          z.object({
            to: reference('glossary'),
            type: z.string(),
            label: z.string().optional(),
          }),
        )
        .default([]),
    }),
})

export const collections = { docs, glossary }
