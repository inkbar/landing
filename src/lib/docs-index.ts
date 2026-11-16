/**
 * The docs index in llms.txt: every docs page, grouped and ordered the way the sidebar is, each
 * linking to its Markdown twin.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { twinPath } from './markdown-twin'

import type { SidebarGroup } from './docs-sidebar'

/** A one-line frontmatter value, plain or quoted. Anything else fails the build. */
function frontmatterValue(source: string, key: string, file: string): string | undefined {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? ''
  const match = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(frontmatter)
  if (!match) return undefined
  // An indented line after the key continues the value over several lines.
  const next = frontmatter.slice(match.index + match[0].length).split(/\r?\n/)[1]
  if (next !== undefined && /^[ \t]+\S/.test(next)) {
    throw new Error(`${file}: write ${key} as a plain one-line value`)
  }
  const raw = match[1]?.trim()
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

/** Every docs page's slug, such as "docs" or "docs/guides/search", from the files on disk. */
function pageSlugs(contentDir: string): string[] {
  const files = (readdirSync(contentDir, { recursive: true }) as string[]).filter(
    (file) => /\.mdx?$/.test(file)
  )
  return files.map((file) => file.replace(/\\/g, '/').replace(/(\/index)?\.mdx?$/, ''))
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
  // A page left out of the sidebar would be left out of llms.txt too, so it fails the build.
  const listed = new Set(sidebar.flatMap(({ items }) => items.map(({ slug }) => slug)))
  const missing = pageSlugs(contentDir).filter((slug) => !listed.has(slug))
  if (missing.length) {
    throw new Error(`Docs pages missing from the sidebar: ${missing.join(', ')}`)
  }
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
