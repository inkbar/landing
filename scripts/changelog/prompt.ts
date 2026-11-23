// What Claude is told when it drafts a release's notes for the changelog page.
import type { Change } from './github.ts'

const SHARED_RULES = `\
- Plain, friendly British English. Short sentences. Say what changed for the developer and \
why it helps, not how it was built.
- Package names such as \`@inkbar/react\` and public API names such as \`doc.form\` are welcome \
in code formatting when they help someone find the feature.
- Leave out what a developer using Inkbar would not notice: CI, builds, tests, refactoring, \
internal documentation, the sandbox, tooling and release chores, unless the commit says it \
changes something they see.
- Never include commit hashes, pull request or issue numbers, file paths, branch names, links, \
plan or milestone labels (such as "1a" or "Track B"), task numbers or internal code names.
- Name third-party projects only when they are a feature: PDF.js, PDFium and shadcn. Never name \
competitors, hosting or CI services.
- Never use em dashes or en dashes. Don't call anything AI.
- Don't start with the version number or a title; the page shows the version.
- Reply with the notes only, in Markdown, with nothing before or after them.`

export const SYSTEM_PROMPT = `\
You write the notes for one release on the changelog page of inkbar.dev. Inkbar is an \
open-source PDF viewer and editor for web apps, with packages for Vue, React, Svelte and plain \
TypeScript. The readers are developers who use Inkbar or are deciding whether to.

You are given the commits and pull requests in this release. Write the notes from them.

Rules:
- Open with one or two sentences on the main change in this release.
- Then short bullets under at most three headings, in this order: ### New, ### Improved, \
### Fixed. Leave out a heading with nothing under it.
${SHARED_RULES}
- If nothing a developer would notice changed, write exactly one line: \
Small fixes and improvements.`

export const LAUNCH_PROMPT = `\
You write the notes for Inkbar's first release on the changelog page of inkbar.dev. Inkbar is \
an open-source PDF viewer and editor for web apps, with packages for Vue, React, Svelte and \
plain TypeScript. The readers are developers who use Inkbar or are deciding whether to.

You are given every commit and pull request up to the first release. Write the notes from them.

Rules:
- Open with a short paragraph on what Inkbar was at its first release.
- Then bullets of what it could do, with no headings.
${SHARED_RULES}`

/** The release's commits and pull requests, as the message Claude drafts from. */
export function userMessage(version: string, changes: Change[]): string {
  const blocks = changes.map(({ subject, body, pr }) =>
    [
      `Commit: ${subject}`,
      body && `Commit message:\n${body}`,
      pr && `Pull request: ${pr.title}`,
      pr?.body && `Pull request description:\n${pr.body}`,
    ]
      .filter(Boolean)
      .join('\n\n')
  )
  return [`Release ${version}`, ...blocks].join('\n\n---\n\n')
}
