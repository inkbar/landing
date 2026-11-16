/**
 * The docs index in llms.txt: every docs page, grouped and ordered the way the sidebar is, each
 * linking to its Markdown twin.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { twinPath } from './markdown-twin'

import type { SidebarGroup } from './docs-sidebar'

/** A one-line frontmatter value, plain or quoted. Anything else fails the build. */
function frontmatterValue(source: string, key: string, file: string): string | undefined {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? ''
  const raw = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(frontmatter)?.[1]?.trim()
  if (raw === undefined || raw === '') return undefined
  if (/^".*"$/.test(raw)) return JSON.parse(raw) as string
  if (/^'.*'$/.test(raw)) return raw.slice(1, -1).replace(/''/g, "'")
  if (/^[>|&*!%@`{[]/.test(raw) || / #/.test(raw)) {
    throw new Error(`${file}: write ${key} as a plain one-line value`)
  }
  return raw
}

function pageFile(contentDir: string, slug: string): string {
  const candidates = ['.md', '.mdx', '/index.md', '/index.mdx'].map((ext) =>
    join(contentDir, `${slug}${ext}`)
  )
  const file = candidates.find((candidate) => existsSync(candidate))
  if (!file) throw new Error(`No docs page for the sidebar slug "${slug}"`)
  return file
}

/**
 * @param sidebar the sidebar groups, in order
 * @param contentDir the docs content directory, such as "src/content/docs"
 * @param site the site URL, ending in a slash
 * @returns Markdown: a heading per sidebar group, then a link per page
 */
export function docsIndex(
  sidebar: SidebarGroup[],
  contentDir: string,
  site: string
): string {
  return sidebar
    .map(({ label, items }) => {
      const lines = items.map(({ slug }) => {
        const file = pageFile(contentDir, slug)
        const source = readFileSync(file, 'utf8')
        const title = frontmatterValue(source, 'title', file)
        if (!title) throw new Error(`${file}: no title`)
        const description = frontmatterValue(source, 'description', file)
        return `- [${title}](${site}${twinPath(slug)})${description ? `: ${description}` : ''}`
      })
      return [`## ${label}`, '', ...lines].join('\n')
    })
    .join('\n\n')
}
