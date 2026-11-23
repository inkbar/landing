import assert from 'node:assert/strict'
import { test } from 'node:test'

import { draftReleases } from './run.ts'

import type { GitHubGet } from './github.ts'
import type { NotesClient } from './notes.ts'
import type { Release } from './versions.ts'

test('every GitHub read finishes before the first Claude call', async () => {
  const events: string[] = []
  const get: GitHubGet = (path) => {
    events.push(`github ${path}`)
    return Promise.resolve({
      commits: [{ commit: { message: 'feat: x' }, parents: [{}] }],
    })
  }
  const client: NotesClient = {
    beta: {
      messages: {
        create: () => {
          events.push('claude')
          return Promise.resolve({
            stop_reason: 'end_turn',
            content: [{ type: 'text', text: '- X.' }],
          })
        },
      },
    },
  }
  const releases: Release[] = [
    { version: '0.1.0', publishedAt: '2026-10-15T10:00:00Z', prerelease: false },
    { version: '0.2.0', publishedAt: '2026-10-16T10:00:00Z', prerelease: false },
    { version: '0.3.0', publishedAt: '2026-10-17T10:00:00Z', prerelease: false },
  ]
  const drafts = await draftReleases(get, client, ['0.2.0', '0.3.0'], releases)
  assert.deepEqual(events, [
    'github /repos/inkbar/inkbar/compare/v0.1.0...v0.2.0',
    'github /repos/inkbar/inkbar/compare/v0.2.0...v0.3.0',
    'claude',
    'claude',
  ])
  assert.deepEqual(drafts, [
    { version: '0.2.0', date: '2026-10-16', notes: '- X.' },
    { version: '0.3.0', date: '2026-10-17', notes: '- X.' },
  ])
})

test('a release with no publish date fails rather than writing an empty date', async () => {
  const get: GitHubGet = () => Promise.resolve({ total_commits: 0, commits: [] })
  const client = {} as NotesClient
  await assert.rejects(
    draftReleases(
      get,
      client,
      ['0.2.0'],
      [
        { version: '0.1.0', publishedAt: '2026-10-15T10:00:00Z', prerelease: false },
        { version: '0.2.0', publishedAt: '', prerelease: false },
      ]
    ),
    /0\.2\.0 has no publish date/
  )
})
