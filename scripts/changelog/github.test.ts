import assert from 'node:assert/strict'
import { test } from 'node:test'

import { collectChanges, type GitHubGet, listReleases, openPrBranches } from './github.ts'

function fakeGet(responses: Record<string, unknown>): GitHubGet & { calls: string[] } {
  const calls: string[] = []
  const get = (path: string): Promise<unknown> => {
    calls.push(path)
    if (!(path in responses))
      return Promise.reject(new Error(`unexpected request ${path}`))
    return Promise.resolve(responses[path])
  }
  return Object.assign(get, { calls })
}

const commit = (message: string, parents = 1) => ({
  commit: { message },
  parents: Array.from({ length: parents }, () => ({ sha: 'x' })),
})

test('listReleases reads versions from the release tags', async () => {
  const get = fakeGet({
    '/repos/inkbar/inkbar/releases?per_page=100': [
      { tag_name: 'v0.2.0', published_at: '2026-10-17T10:00:00Z', prerelease: false },
      {
        tag_name: 'v0.2.0-beta.1',
        published_at: '2026-10-16T10:00:00Z',
        prerelease: true,
      },
    ],
  })
  assert.deepEqual(await listReleases(get), [
    { version: '0.2.0', publishedAt: '2026-10-17T10:00:00Z', prerelease: false },
    { version: '0.2.0-beta.1', publishedAt: '2026-10-16T10:00:00Z', prerelease: true },
  ])
})

test('collectChanges drops release chores and merges and reads each pull request once', async () => {
  const get = fakeGet({
    '/repos/inkbar/inkbar/compare/v0.1.1...v0.2.0': {
      commits: [
        commit('feat: add x (#12)\n\nWhy x.'),
        commit('fix: tidy x (#12)'),
        commit('Merge branch main', 2),
        commit('chore: release 0.2.0 (#13)'),
      ],
    },
    '/repos/inkbar/inkbar/pulls/12': { title: 'feat: add x', body: 'Adds x.' },
  })
  const changes = await collectChanges(get, '0.1.1', '0.2.0')
  assert.deepEqual(changes, [
    {
      subject: 'feat: add x (#12)',
      body: 'Why x.',
      pr: { title: 'feat: add x', body: 'Adds x.' },
    },
    {
      subject: 'fix: tidy x (#12)',
      body: '',
      pr: { title: 'feat: add x', body: 'Adds x.' },
    },
  ])
  assert.equal(get.calls.filter((path) => path.endsWith('/pulls/12')).length, 1)
})

test('collectChanges reads every commit up to the first release, oldest first', async () => {
  const get = fakeGet({
    '/repos/inkbar/inkbar/commits?sha=v0.1.0&per_page=100': [
      commit('feat: second'),
      commit('feat: first'),
    ],
  })
  const changes = await collectChanges(get, null, '0.1.0')
  assert.deepEqual(
    changes.map(({ subject }) => subject),
    ['feat: first', 'feat: second']
  )
})

test('openPrBranches maps each version in an open changelog pull request to its branch', async () => {
  const get = fakeGet({
    '/repos/inkbar/landing/pulls?state=open&per_page=100': [
      { number: 70, head: { ref: 'changelog/backfill' } },
      { number: 71, head: { ref: 'seo-page-titles' } },
    ],
    '/repos/inkbar/landing/pulls/70/files?per_page=100': [
      { filename: 'src/content/changelog/0.1.0.md' },
      { filename: 'src/content/changelog/0.1.1.md' },
      { filename: 'README.md' },
    ],
  })
  assert.deepEqual(
    await openPrBranches(get),
    new Map([
      ['0.1.0', 'changelog/backfill'],
      ['0.1.1', 'changelog/backfill'],
    ])
  )
})
