/**
 * Helpers for the changelog: one Markdown file per Inkbar release in src/content/changelog,
 * named by its version. Plain TypeScript with no imports, so the drafting script can run it
 * under Node as well as the site build.
 */

/** Compares two "x.y.z" versions: negative when a is older, positive when newer. */
export function compareVersions(a: string, b: string): number {
  const left = a.split('.').map(Number)
  const right = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0)
    if (difference !== 0) return difference
  }
  return 0
}

/** The id of a release's section on the page: "0.18.0" → "v0-18-0". */
export function releaseAnchor(version: string): string {
  return `v${version.replaceAll('.', '-')}`
}

/** The release on GitHub, with release-please's full changelog. */
export function releaseUrl(version: string): string {
  return `https://github.com/inkbar/inkbar/releases/tag/v${version}`
}

/** A copy of the entries, newest release first. */
export function newestFirst<T extends { data: { version: string } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => compareVersions(b.data.version, a.data.version))
}

/** Fails the build when a file's version doesn't match its name. */
export function checkVersionIds(
  entries: { id: string; data: { version: string } }[]
): void {
  for (const { id, data } of entries) {
    if (id !== data.version) {
      throw new Error(`src/content/changelog/${id}.md says version ${data.version}`)
    }
  }
}
