import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageSources } from './sitemap-lastmod.ts'

test('a use-case page is dated by its copy and its screenshot', () => {
  assert.deepEqual(pageSources('/use-cases/redact-pdfs/'), [
    'src/content/use-cases/redact-pdfs.md',
    'src/assets/use-cases/redact-pdfs.png',
  ])
})

test('the use-case overview is dated by every page and its own source', () => {
  assert.deepEqual(pageSources('/use-cases/'), [
    'src/content/use-cases',
    'src/pages/use-cases/index.astro',
  ])
})
