// The description of the pull request a changelog run opens.
import { FRONTMATTER_LINES } from './notes.ts'

import type { Finding } from './scan.ts'

export function prBody(findings: Map<string, Finding[]>, versions: string[]): string {
  const checks = [...findings].flatMap(([version, list]) =>
    list.map(
      ({ line, rule, match }) =>
        `- \`src/content/changelog/${version}.md\` line ${line + FRONTMATTER_LINES}: ${rule} \`${match}\``
    )
  )
  const releases = versions.length === 1 ? versions[0] : `${versions.length} releases`
  return (
    [
      ...(checks.length > 0 ? ['### Check these', checks.join('\n')] : []),
      `Claude drafted these notes from the commits and pull requests in ${releases}. They appear on the changelog page once this merges.`,
      `Edit the file in this pull request to change them. To start a release again, run the Changelog workflow from the Actions tab and name the release. That replaces that release's notes on this branch, edits included, and leaves the others alone.`,
    ].join('\n\n') + '\n'
  )
}
