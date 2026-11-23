import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'

import { shots, shotUrl } from './shots.ts'

test('there is one shot per use-case page', () => {
  assert.deepEqual(
    shots.map(({ slug }) => slug),
    ['redact-pdfs', 'fill-pdf-forms', 'sign-pdfs', 'review-pdfs']
  )
})

test('every shot names a sample document that exists', () => {
  for (const { document } of shots) {
    assert.ok(existsSync(new URL(`documents/${document}`, import.meta.url)), document)
  }
})

test('the redaction shot loads the engine and the area tool, and the signing shot the signature tool', () => {
  const redact = shots.find(({ slug }) => slug === 'redact-pdfs')
  assert.equal(redact?.engine, true)
  assert.ok(redact?.tools.includes('redact-area'))
  assert.ok(shots.find(({ slug }) => slug === 'sign-pdfs')?.tools.includes('signature'))
})

test('shotUrl names the shot in the query', () => {
  assert.equal(
    shotUrl('http://localhost:5199/', shots[0]),
    'http://localhost:5199/?shot=redact-pdfs'
  )
})
