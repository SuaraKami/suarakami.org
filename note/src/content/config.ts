import { defineCollection, reference, z } from 'astro:content'

const docs = defineCollection({
  schema: ({ image }) =>
    z.object({
      created: z.date(),
      hero: image().optional(),
      history: z
        .array(
          z.object({
            author: z.string(),
            date: z.date(),
            message: z.string(),
          })
        )
        .default([]),
      summary: z.string().optional(),
      title: z.string(),
      updated: z.date(),
    }),
  type: 'content',
})

const glossary = defineCollection({
  schema: () =>
    z.object({
      aliases: z.array(z.string()).default([]),
      definition: z.string(),
      lang: z.string().default('ID'),
      relations: z
        .array(
          z.object({
            to: reference('glossary'),
            type: z.enum([
              'sinonim',
              'antonim',
              'turunan',
              'bagian_dari',
              'mencakup',
              'contoh',
              'konsep_terkait',
            ]),
          })
        )
        .default([]),
      term: z.string(),
    }),
  type: 'data',
})

export const collections = { docs, glossary }
