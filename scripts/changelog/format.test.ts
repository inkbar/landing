import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formatFile } from './format.ts'

test('formatFile writes the notes as the repo formats them', async () => {
  const text = '---\nversion: 0.18.0\ndate: 2026-11-24\n---\n\n### New\n- A thing.\n'
  assert.equal(
    await formatFile(text),
    '---\nversion: 0.18.0\ndate: 2026-11-24\n---\n\n### New\n\n- A thing.\n'
  )
})
