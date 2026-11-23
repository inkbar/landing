import assert from 'node:assert/strict'
import { test } from 'node:test'

import { prBody } from './pr-body.ts'

test('with no findings the body has no check list', () => {
  const body = prBody(new Map(), ['0.18.0'])
  assert.doesNotMatch(body, /Check these/)
  assert.match(body, /Claude drafted these notes from the commits/)
  assert.match(body, /Edit the file/)
  assert.match(body, /Changelog workflow/)
})

test('findings are listed first, by release and line', () => {
  const body = prBody(
    new Map([['0.18.0', [{ line: 3, rule: 'pr-number', match: '#448' }]]]),
    ['0.18.0']
  )
  assert.match(body, /^### Check these\n\n- 0\.18\.0 line 3: pr-number "#448"\n/)
})
