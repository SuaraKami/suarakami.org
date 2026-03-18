import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection, reference } from 'astro:content'

const docs = defineCollection({
  loader: glob({
    base: './src/content/docs',
    pattern: '**/*.md',
  }),
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
      sortOrder: z.number().default(0),
      summary: z.string().optional(),
      title: z.string(),
      updated: z.date(),
    }),
})

const glossary = defineCollection({
  loader: glob({
    base: './src/content/glossary',
    pattern: '**/*.json',
  }),
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
})

export const collections = { docs, glossary }
