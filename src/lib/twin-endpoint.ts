// Serves each docs page as Markdown. The route files mount it at docs/<slug>.md and
// docs/<slug>/index.md, and the docs home at docs.md and docs/index.md.
import { type CollectionEntry, getCollection, getEntry } from 'astro:content'

import { siteUrl, toMarkdown } from './markdown-twin'

import type { APIRoute } from 'astro'

type Props = { entry: CollectionEntry<'docs'> }

export async function getStaticPaths() {
  const entries = await getCollection('docs', ({ id }) => id.startsWith('docs/'))
  return entries.map((entry) => ({
    params: { slug: entry.id.slice('docs/'.length) },
    props: { entry } satisfies Props,
  }))
}

function respond({ id, data, body }: CollectionEntry<'docs'>): Response {
  const markdown = toMarkdown(
    { id, title: data.title, description: data.description, body: body ?? '' },
    siteUrl(import.meta.env.BASE_URL)
  )
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

export const GET: APIRoute = ({ props }) => respond((props as Props).entry)

/** The docs home, which has no slug below docs/. */
export const GET_HOME: APIRoute = async () => {
  const entry = await getEntry('docs', 'docs')
  if (!entry) throw new Error('The docs home page is missing')
  return respond(entry)
}
