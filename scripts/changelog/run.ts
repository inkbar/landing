// Drafts a set of releases. Every GitHub read happens before the first Claude call, so the
// Claude calls run back to back while the run's short-lived credentials are fresh.
import { type Change, collectChanges, type GitHubGet } from './github.ts'
import { draftNotes, type NotesClient } from './notes.ts'
import { previousVersion, type Release } from './versions.ts'

export interface Draft {
  version: string
  date: string
  notes: string
}

export async function draftReleases(
  get: GitHubGet,
  client: NotesClient,
  versions: string[],
  releases: Release[]
): Promise<Draft[]> {
  const inputs: {
    version: string
    date: string
    base: string | null
    changes: Change[]
  }[] = []
  for (const version of versions) {
    const release = releases.find((candidate) => candidate.version === version)
    if (!release) throw new Error(`${version} is not a published release`)
    if (!release.publishedAt) throw new Error(`${version} has no publish date`)
    const base = previousVersion(version, releases)
    inputs.push({
      version,
      date: release.publishedAt.slice(0, 10),
      base,
      changes: await collectChanges(get, base, version),
    })
  }
  const drafts: Draft[] = []
  for (const { version, date, base, changes } of inputs) {
    drafts.push({
      version,
      date,
      notes: await draftNotes(client, version, changes, base === null),
    })
    console.error(`Drafted ${version} from ${changes.length} commits`)
  }
  return drafts
}
