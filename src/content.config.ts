import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // One file per Inkbar release, named by its version, with the notes the changelog page shows.
  changelog: defineCollection({
    // The id is the file name as written: the default slug would turn "0.18.0" into "0180".
    loader: glob({
      pattern: '*.md',
      base: './src/content/changelog',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: z.object({
      version: z.string().regex(/^\d+\.\d+\.\d+$/),
      date: z.coerce.date(),
    }),
  }),
  // One page per job someone searches for, such as redacting PDFs in a web app.
  useCases: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/use-cases' }),
    schema: ({ image }) =>
      z.object({
        title: z.string().max(60),
        description: z.string().min(50).max(160),
        heading: z.string(),
        lede: z.string(),
        screenshot: image(),
        alt: z.string().min(1),
        guide: z.enum(['redaction', 'forms', 'signatures', 'annotations']),
        // The link text in the footer's Use cases column.
        label: z.string(),
        order: z.number(),
      }),
  }),
}
