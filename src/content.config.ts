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
}
