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

const glossary = defineCollection({
  type: 'data',
  schema: z.object({
    term: z.string(),
    senseId: z.string(),
    definition: z.string(),
    lang: z.string().default('EN'),
    pos: z.string(),
    confidence: z.number().min(0).max(1).default(1),
    aliases: z.array(z.string()).default([]),
    examples: z.array(z.string()).default([]),
    relations: z
      .array(
        z.object({
          to: z.string(),
          type: z.string(),
          label: z.string().optional(),
          weight: z.number().optional(),
        }),
      )
      .default([]),
    sourceMeta: z.object({
      provider: z.literal('BabelNet'),
      fetchedAt: z.string(),
    }),
  }),
})

export const collections = { docs, glossary }
