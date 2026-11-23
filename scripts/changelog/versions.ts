// Which releases a run drafts, and which release each one follows.
import { compareVersions } from '../../src/lib/changelog.ts'

export interface Release {
  version: string
  publishedAt: string
  prerelease: boolean
}

const stableVersion = /^\d+\.\d+\.\d+$/

/** " v0.18.0 " → "0.18.0", so a version typed in the Actions tab still matches. */
export function normaliseVersion(input: string): string {
  return input.trim().replace(/^v/, '')
}

function stable(releases: Release[]): Release[] {
  return releases
    .filter(({ version, prerelease }) => !prerelease && stableVersion.test(version))
    .sort((a, b) => compareVersions(a.version, b.version))
}

/** The newest stable release before this one, or null for the first release. */
export function previousVersion(version: string, releases: Release[]): string | null {
  const older = stable(releases).filter(
    (release) => compareVersions(release.version, version) < 0
  )
  return older.at(-1)?.version ?? null
}

/**
 * The releases to draft, oldest first. `missing` and a dispatch skip any release that already
 * has notes on main or in an open pull request; naming releases by hand redrafts them.
 */
export function resolveVersions(
  request: { versions: string; trigger: 'dispatch' | 'manual' },
  releases: Release[],
  onMain: Set<string>,
  inOpenPrs: Set<string>
): { version: string; overwrite: boolean }[] {
  const published = stable(releases).map(({ version }) => version)
  const untouched = (version: string) => !onMain.has(version) && !inOpenPrs.has(version)
  if (request.versions.trim() === 'missing') {
    return published.filter(untouched).map((version) => ({ version, overwrite: false }))
  }
  const named = request.versions.split(',').map(normaliseVersion).filter(Boolean)
  for (const version of named) {
    if (!published.includes(version))
      throw new Error(`${version} is not a published release`)
  }
  const ordered = [...new Set(named)].sort(compareVersions)
  if (request.trigger === 'dispatch') {
    return ordered.filter(untouched).map((version) => ({ version, overwrite: false }))
  }
  return ordered.map((version) => ({ version, overwrite: true }))
}
