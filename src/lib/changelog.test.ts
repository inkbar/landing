import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  checkVersionIds,
  compareVersions,
  newestFirst,
  releaseAnchor,
  releaseUrl,
} from './changelog.ts'

test('compareVersions orders by number, not by text', () => {
  assert.ok(compareVersions('0.9.0', '0.10.0') < 0)
  assert.ok(compareVersions('1.0.0', '0.17.0') > 0)
  assert.equal(compareVersions('0.3.1', '0.3.1'), 0)
})

test('releaseAnchor and releaseUrl name a release', () => {
  assert.equal(releaseAnchor('0.18.0'), 'v0-18-0')
  assert.equal(
    releaseUrl('0.18.0'),
    'https://github.com/inkbar/inkbar/releases/tag/v0.18.0'
  )
})

test('newestFirst sorts a copy, newest release first', () => {
  const entries = ['0.9.0', '0.17.0', '0.10.0'].map((version) => ({ data: { version } }))
  const sorted = newestFirst(entries)
  assert.deepEqual(
    sorted.map(({ data }) => data.version),
    ['0.17.0', '0.10.0', '0.9.0']
  )
  assert.deepEqual(
    entries.map(({ data }) => data.version),
    ['0.9.0', '0.17.0', '0.10.0']
  )
})

test('checkVersionIds rejects a file whose version does not match its name', () => {
  assert.doesNotThrow(() =>
    checkVersionIds([{ id: '0.18.0', data: { version: '0.18.0' } }])
  )
  assert.throws(
    () => checkVersionIds([{ id: '0.18.0', data: { version: '0.17.0' } }]),
    /0\.18\.0\.md says version 0\.17\.0/
  )
})
