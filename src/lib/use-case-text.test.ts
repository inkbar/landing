import assert from 'node:assert/strict'
import { test } from 'node:test'

import { inline, splitHeading } from './use-case-text.ts'

test('inline renders code spans and links and escapes everything else', () => {
  assert.equal(
    inline(
      'Use `doc.save()` & see [the guide](/docs/guides/saving/) <b>now</b>',
      (path) => `/base${path}`
    ),
    'Use <code>doc.save()</code> &amp; see <a href="/base/docs/guides/saving/">the guide</a> &lt;b&gt;now&lt;/b&gt;'
  )
})

test('inline leaves absolute links as they are and escapes code', () => {
  assert.equal(
    inline(
      '[GitHub](https://github.com/inkbar/inkbar) and `a<b>`',
      (path) => `/base${path}`
    ),
    '<a href="https://github.com/inkbar/inkbar">GitHub</a> and <code>a&lt;b&gt;</code>'
  )
})

test('splitHeading finds the one marked phrase', () => {
  assert.deepEqual(splitHeading('Let people [redact] PDFs in your app'), {
    before: 'Let people ',
    marked: 'redact',
    after: ' PDFs in your app',
  })
})

test('splitHeading needs exactly one marked phrase', () => {
  assert.throws(() => splitHeading('No mark here'), /one \[marked\] phrase/)
  assert.throws(() => splitHeading('[Two] marks [here]'), /one \[marked\] phrase/)
})
