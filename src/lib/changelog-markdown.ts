// The changelog as one Markdown document, served at /changelog.md for agents.
import { newestFirst, releaseUrl } from './changelog.ts'

interface ChangelogEntry {
  data: { version: string; date: Date }
  body?: string
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeZone: 'UTC',
})

/** Every release, newest first, after a title and the note pointing agents at llms.txt. */
export function changelogMarkdown(entries: ChangelogEntry[], note: string): string {
  const releases = newestFirst(entries).map(({ data, body }) =>
    [
      `## ${data.version} (${dateFormat.format(data.date)})`,
      (body ?? '').trim(),
      `[Full changelog on GitHub](${releaseUrl(data.version)})`,
    ].join('\n\n')
  )
  return ['# Inkbar changelog', `> ${note}`, ...releases].join('\n\n') + '\n'
}
