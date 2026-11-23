// Formats a changelog file as the repo's Prettier config does, so the file the workflow commits
// is the file the scan read, and "Check these" line numbers match it.
import { fileURLToPath } from 'node:url'

import { format, resolveConfig } from 'prettier'

const sample = fileURLToPath(
  new URL('../../src/content/changelog/notes.md', import.meta.url)
)

export async function formatFile(text: string): Promise<string> {
  const config = (await resolveConfig(sample)) ?? {}
  return format(text, { ...config, filepath: sample })
}
