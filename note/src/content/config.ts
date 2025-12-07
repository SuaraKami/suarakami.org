import { defineCollection, reference, z } from "astro:content";

const docs = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      created: z.date(),
      updated: z.date(),
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
    }),
});

const glossary = defineCollection({
  type: "data",
  schema: () =>
    z.object({
      term: z.string(),
      definition: z.string(),
      lang: z.string().default("ID"),
      aliases: z.array(z.string()).default([]),
      relations: z
        .array(
          z.object({
            to: reference("glossary"),
            type: z.enum([
              "sinonim",
              "antonim",
              "turunan",
              "bagian_dari",
              "mencakup",
              "contoh",
              "konsep_terkait",
            ]),
          })
        )
        .default([]),
    }),
});

export const collections = { docs, glossary };
