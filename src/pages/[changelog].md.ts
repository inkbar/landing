// The changelog as Markdown, at /changelog.md, for agents. Like the page, it exists only once
// the changelog has notes.
import { getCollection } from 'astro:content'

import { changelogMarkdown } from '../lib/changelog-markdown'
import { agentNote, siteUrl } from '../lib/markdown-twin'

import type { APIRoute } from 'astro'

export async function getStaticPaths() {
  const entries = await getCollection('changelog')
  return entries.length === 0 ? [] : [{ params: { changelog: 'changelog' } }]
}

export const GET: APIRoute = async () => {
  const entries = await getCollection('changelog')
  const markdown = changelogMarkdown(
    entries,
    agentNote(siteUrl(import.meta.env.BASE_URL))
  )
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
