import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

/** The files whose last commit dates the landing page. */
const landingSources = [
  'src/pages/index.astro',
  'src/layouts/Landing.astro',
  'src/components/landing',
  'src/components/site',
]

/**
 * The source files behind a page, from its path with the base removed: the landing page's
 * components for `/`, or the docs page's Markdown for `/docs/...`. Returns no files for a
 * path that matches neither.
 */
export function pageSources(path: string, root = '.'): string[] {
  if (path === '/') return landingSources
  if (path === '/changelog/') return ['src/content/changelog']
  const useCase = /^\/use-cases\/([a-z-]+)\/$/.exec(path)?.[1]
  if (useCase) {
    return [`src/content/use-cases/${useCase}.md`, `src/assets/use-cases/${useCase}.png`]
  }
  const slug = /^\/(docs(?:\/.+?)?)\/?$/.exec(path)?.[1]
  if (!slug) return []
  const stem = `src/content/docs/${slug}`
  return [`${stem}.md`, `${stem}.mdx`, `${stem}/index.md`, `${stem}/index.mdx`].filter(
    (file) => existsSync(`${root}/${file}`)
  )
}

/**
 * When the last commit touched any of the files, or undefined when git is missing or has no
 * history for them. A shallow clone dates every file to its one commit, so the deploy checks
 * out the full history.
 */
export function lastCommitDate(files: string[], root = '.'): Date | undefined {
  if (files.length === 0) return undefined
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], {
      cwd: root,
      encoding: 'utf8',
    }).trim()
    return iso ? new Date(iso) : undefined
  } catch {
    return undefined
  }
}
