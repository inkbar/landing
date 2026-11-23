import assert from 'node:assert/strict'
import { test } from 'node:test'

import { scanNotes } from './scan.ts'

test('a clean note has no findings', () => {
  const notes = [
    'Forms now save into the PDF.',
    '',
    '### New',
    '',
    '- `@inkbar/react` gains a `useForm` hook, and `doc.form` reads values.',
    '- Pages render on PDF.js, and PDFium writes the file.',
  ].join('\n')
  assert.deepEqual(scanNotes(notes), [])
})

test('each rule flags its own line', () => {
  const lines = [
    'Fixed in #448.',
    'See a15bdea.',
    'Faster — and smaller.',
    'Finishes Track B.',
    'Uses AI to suggest redactions.',
    'Tested on BrowserStack.',
    'Adds <script> support.',
  ]
  assert.deepEqual(
    scanNotes(lines.join('\n')).map(({ line, rule }) => [line, rule]),
    [
      [1, 'pr-number'],
      [2, 'hash'],
      [3, 'dash'],
      [4, 'plan-label'],
      [5, 'ai'],
      [6, 'vendor'],
      [7, 'html'],
    ]
  )
  assert.equal(scanNotes('Fixed in #448.')[0]?.match, '#448')
})

test('raw HTML at the end of a line is flagged', () => {
  assert.deepEqual(
    scanNotes('Adds a <script').map(({ rule }) => rule),
    ['html']
  )
})

test('links and bare URLs are flagged', () => {
  assert.deepEqual(
    scanNotes('See [the docs](/docs/).').map(({ rule }) => rule),
    ['link']
  )
  assert.deepEqual(
    scanNotes('See https://inkbar.dev.').map(({ rule }) => rule),
    ['link']
  )
})

test('cubic Bézier curves are not a vendor', () => {
  assert.deepEqual(scanNotes('Ink strokes fit cubic Bézier curves.'), [])
  assert.deepEqual(
    scanNotes('Reviewed by cubic.').map(({ rule }) => rule),
    ['vendor']
  )
})
