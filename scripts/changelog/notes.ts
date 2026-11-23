// Drafts one release's notes with Claude and writes them as a changelog file.
import { LAUNCH_PROMPT, SYSTEM_PROMPT, userMessage } from './prompt.ts'

import type { Change } from './github.ts'

export type NotesRequest = {
  model: 'claude-opus-5-5'
  max_tokens: number
  system: string
  messages: { role: 'user'; content: string }[]
  output_config: { effort: 'low' }
  betas: ['server-side-fallback-2026-07-01']
  fallbacks: 'default'
}

export type NotesReply = {
  stop_reason: string | null
  content: { type: string; text?: string }[]
}

/** The part of the Anthropic client drafting uses, so tests can stand in for it. */
export interface NotesClient {
  beta: { messages: { create(request: NotesRequest): Promise<NotesReply> } }
}

export const NOTHING_TO_SAY = 'Small fixes and improvements.'

/** Removes one fence wrapped round the whole reply, and rejects a reply that opens with a title. */
export function cleanReply(text: string): string {
  let notes = text.trim()
  const fenced = /^```[\w-]*\n([\s\S]*?)\n```$/.exec(notes)
  if (fenced) notes = (fenced[1] ?? '').trim()
  if (/^#{1,2}\s/.test(notes)) throw new Error('The notes start with a title')
  return notes
}

export async function draftNotes(
  client: NotesClient,
  version: string,
  changes: Change[],
  launch: boolean
): Promise<string> {
  if (changes.length === 0) return NOTHING_TO_SAY
  const reply = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    system: launch ? LAUNCH_PROMPT : SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage(version, changes) }],
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  })
  if (reply.stop_reason === 'refusal')
    throw new Error(`Claude refused to draft ${version}`)
  // Anything else, such as max_tokens, means the notes were cut off.
  if (reply.stop_reason !== 'end_turn') {
    throw new Error(`Claude stopped early (${reply.stop_reason}) drafting ${version}`)
  }
  const text = reply.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('')
  if (!text.trim()) throw new Error(`Claude returned empty notes for ${version}`)
  return cleanReply(text)
}

/** The changelog file for a release: its frontmatter, then the notes. */
export function notesFile(version: string, date: string, notes: string): string {
  return `---\nversion: ${version}\ndate: ${date}\n---\n\n${notes.trim()}\n`
}
