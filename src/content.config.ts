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
        // The same state captured on a phone, shown in a phone frame on narrow screens.
        phoneScreenshot: image(),
        alt: z.string().min(1),
        guide: z.enum(['redaction', 'forms', 'signatures', 'annotations']),
        // The link text in the footer's Use cases column.
        label: z.string(),
        order: z.number(),
        // The heading's one [marked] phrase is drawn with the page's own tool.
        mark: z.enum(['redact', 'field', 'signature', 'highlight']),
        // The overview page: one line under the heading, and where its screenshot crop centres.
        summary: z.string().max(110),
        focus: z.string().regex(/^\d+% \d+%$/),
        // The address the screenshot's browser frame shows: a made-up page in the reader's own app.
        address: z.string().regex(/^app\.example\.com\//),
        users: z.array(z.string()).min(1),
        app: z.array(z.string()).min(1),
        // Margin notes beside the example: the limits, and anything a reader must know first.
        notes: z.array(z.object({ heading: z.string(), text: z.string() })).min(1),
        exampleIntro: z.string().optional(),
        example: z.string(),
      }),
  }),
}
