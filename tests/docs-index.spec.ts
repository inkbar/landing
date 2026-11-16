import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { expect, test } from '@playwright/test'

import { docsIndex } from '../src/lib/docs-index'

const site = 'https://inkbar.dev/'
let dir: string

function page(path: string, frontmatter: string) {
  const file = join(dir, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `---\n${frontmatter}\n---\n\nBody.\n`)
}

test.beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'docs-index-'))
  page('docs/index.mdx', 'title: Introduction\ndescription: Where to start.')
  page('docs/guides/search.mdx', "title: 'Search: find text'\nsidebar:\n  order: 1")
})

test.afterEach(() => rmSync(dir, { recursive: true, force: true }))

const sidebar = [
  {
    label: 'Start',
    items: [
      { label: 'Introduction', slug: 'docs' },
      { label: 'Search', slug: 'docs/guides/search' },
    ],
  },
]

test('lists each sidebar page with its description, linking the Markdown', () => {
  expect(docsIndex(sidebar, dir, site)).toBe(
    [
      '## Start',
      '',
      '- [Introduction](https://inkbar.dev/docs.md): Where to start.',
      '- [Search: find text](https://inkbar.dev/docs/guides/search.md)',
    ].join('\n')
  )
})

test('fails on a docs page the sidebar leaves out', () => {
  page('docs/guides/hidden.md', 'title: Hidden')
  expect(() => docsIndex(sidebar, dir, site)).toThrow(
    'Docs pages missing from the sidebar: docs/guides/hidden'
  )
})

test('fails on a description that runs over several lines', () => {
  page('docs/index.mdx', 'title: Introduction\ndescription: Where\n  to start.')
  expect(() => docsIndex(sidebar, dir, site)).toThrow(
    'write description as a plain one-line value'
  )
})
