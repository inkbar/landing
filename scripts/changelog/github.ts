// Reads releases, commits and pull requests from GitHub's REST API.
import type { Release } from './versions.ts'

/** Fetches one API path, such as "/repos/inkbar/inkbar/releases?per_page=100". */
export type GitHubGet = (path: string) => Promise<unknown>

export interface Change {
  subject: string
  body: string
  pr?: { title: string; body: string }
}

interface ApiCommit {
  commit: { message: string }
  parents: unknown[]
}

/** A GitHubGet that follows `Link: rel="next"` pages and joins list responses. */
export function githubGet(token: string): GitHubGet {
  return async (path) => {
    let url: string | null = `https://api.github.com${path}`
    let joined: unknown[] | null = null
    while (url) {
      const response: Response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      if (!response.ok) throw new Error(`GitHub answered ${response.status} for ${path}`)
      const data: unknown = await response.json()
      if (!Array.isArray(data)) return data
      joined = [...(joined ?? []), ...(data as unknown[])]
      url =
        /<([^>]+)>;\s*rel="next"/.exec(response.headers.get('link') ?? '')?.[1] ?? null
    }
    return joined
  }
}

export async function listReleases(get: GitHubGet): Promise<Release[]> {
  const releases = (await get('/repos/inkbar/inkbar/releases?per_page=100')) as {
    tag_name: string
    published_at: string
    prerelease: boolean
  }[]
  return releases.map((release) => ({
    version: release.tag_name.replace(/^v/, ''),
    publishedAt: release.published_at,
    prerelease: release.prerelease,
  }))
}

const releaseChore = /^chore(\(.+\))?: release /
const prNumber = /\(#(\d+)\)/

/**
 * The commits after `base` up to `version`, oldest first, without merges or release-please's
 * own commits, each with its pull request's title and body. With no base, every commit up to
 * the first release. The compare API returns up to 250 commits, more than any release has had.
 */
export async function collectChanges(
  get: GitHubGet,
  base: string | null,
  version: string
): Promise<Change[]> {
  const commits =
    base === null
      ? (
          (await get(
            `/repos/inkbar/inkbar/commits?sha=v${version}&per_page=100`
          )) as ApiCommit[]
        )
          .slice()
          .reverse()
      : (
          (await get(`/repos/inkbar/inkbar/compare/v${base}...v${version}`)) as {
            commits: ApiCommit[]
          }
        ).commits
  const prs = new Map<string, Promise<{ title: string; body: string }>>()
  const changes: Change[] = []
  for (const { commit, parents } of commits) {
    if (parents.length > 1) continue
    const [subject = '', ...rest] = commit.message.split('\n')
    if (releaseChore.test(subject)) continue
    const change: Change = { subject, body: rest.join('\n').trim() }
    const number = prNumber.exec(subject)?.[1]
    if (number) {
      if (!prs.has(number)) {
        prs.set(
          number,
          (
            get(`/repos/inkbar/inkbar/pulls/${number}`) as Promise<{
              title: string
              body: string | null
            }>
          ).then(({ title, body }) => ({ title, body: body ?? '' }))
        )
      }
      change.pr = await prs.get(number)
    }
    changes.push(change)
  }
  return changes
}

/** Each release whose notes sit in an open changelog pull request on inkbar/landing, and its branch. */
export async function openPrBranches(get: GitHubGet): Promise<Map<string, string>> {
  const pulls = (await get('/repos/inkbar/landing/pulls?state=open&per_page=100')) as {
    number: number
    head: { ref: string }
  }[]
  const branches = new Map<string, string>()
  for (const pull of pulls.filter(({ head }) => head.ref.startsWith('changelog/'))) {
    const files = (await get(
      `/repos/inkbar/landing/pulls/${pull.number}/files?per_page=100`
    )) as {
      filename: string
    }[]
    for (const { filename } of files) {
      const version = /^src\/content\/changelog\/(.+)\.md$/.exec(filename)?.[1]
      if (version) branches.set(version, pull.head.ref)
    }
  }
  return branches
}
