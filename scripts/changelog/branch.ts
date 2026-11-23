// Which branch a run's notes go on. Releases already in an open changelog pull request are
// redrafted on that pull request's branch, so its other notes and Ed's edits stay; new
// releases get a branch of their own.

export function chooseBranch(
  versions: string[],
  openPrs: Map<string, string>
): { branch: string; existing: boolean } {
  const open = new Set(versions.flatMap((version) => openPrs.get(version) ?? []))
  if (open.size > 1) {
    throw new Error(
      `${versions.join(', ')} sit in two open pull requests: redraft them separately`
    )
  }
  const [branch] = open
  if (branch) return { branch, existing: true }
  const first = versions[0]
  const last = versions.at(-1)
  return {
    branch: first === last ? `changelog/${first}` : `changelog/${first}-${last}`,
    existing: false,
  }
}
