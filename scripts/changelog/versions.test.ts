import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  normaliseVersion,
  previousVersion,
  type Release,
  resolveVersions,
} from './versions.ts'

const releases: Release[] = [
  { version: '0.1.0', publishedAt: '2026-10-15T10:00:00Z', prerelease: false },
  { version: '0.1.1', publishedAt: '2026-10-15T10:40:00Z', prerelease: false },
  { version: '0.2.0-beta.1', publishedAt: '2026-10-16T10:00:00Z', prerelease: true },
  { version: '0.2.0', publishedAt: '2026-10-17T10:00:00Z', prerelease: false },
]

test('normaliseVersion trims and drops a leading v', () => {
  assert.equal(normaliseVersion(' v0.18.0 '), '0.18.0')
  assert.equal(normaliseVersion('0.18.0'), '0.18.0')
})

test('previousVersion skips prereleases and has none for the first release', () => {
  assert.equal(previousVersion('0.2.0', releases), '0.1.1')
  assert.equal(previousVersion('0.1.0', releases), null)
})

test('missing drafts stable releases with no file and no open pull request', () => {
  assert.deepEqual(
    resolveVersions(
      { versions: 'missing', trigger: 'manual' },
      releases,
      new Set(['0.1.0']),
      new Set(['0.1.1'])
    ),
    [{ version: '0.2.0', overwrite: false }]
  )
})

test('a dispatch never overwrites notes on main or in an open pull request', () => {
  const request = { versions: '0.2.0', trigger: 'dispatch' } as const
  assert.deepEqual(resolveVersions(request, releases, new Set(['0.2.0']), new Set()), [])
  assert.deepEqual(resolveVersions(request, releases, new Set(), new Set(['0.2.0'])), [])
  assert.deepEqual(resolveVersions(request, releases, new Set(), new Set()), [
    { version: '0.2.0', overwrite: false },
  ])
})

test('naming versions by hand redrafts them', () => {
  assert.deepEqual(
    resolveVersions(
      { versions: 'v0.1.0, 0.2.0', trigger: 'manual' },
      releases,
      new Set(['0.1.0', '0.2.0']),
      new Set()
    ),
    [
      { version: '0.1.0', overwrite: true },
      { version: '0.2.0', overwrite: true },
    ]
  )
})

test('an unknown version fails, naming it', () => {
  assert.throws(
    () =>
      resolveVersions(
        { versions: '0.9.9', trigger: 'manual' },
        releases,
        new Set(),
        new Set()
      ),
    /0\.9\.9 is not a published release/
  )
})
