import assert from 'node:assert/strict'
import { test } from 'node:test'

import { chooseBranch } from './branch.ts'

const open = new Map([
  ['0.1.0', 'changelog/0.1.0-0.17.0'],
  ['0.3.0', 'changelog/0.1.0-0.17.0'],
  ['0.18.0', 'changelog/0.18.0'],
])

test('a new release gets a branch of its own', () => {
  assert.deepEqual(chooseBranch(['0.19.0'], open), {
    branch: 'changelog/0.19.0',
    existing: false,
  })
})

test('several new releases get a branch named for their range', () => {
  assert.deepEqual(chooseBranch(['0.19.0', '0.20.0'], open), {
    branch: 'changelog/0.19.0-0.20.0',
    existing: false,
  })
})

test('redrafting releases in an open pull request commits to its branch', () => {
  assert.deepEqual(chooseBranch(['0.3.0'], open), {
    branch: 'changelog/0.1.0-0.17.0',
    existing: true,
  })
  assert.deepEqual(chooseBranch(['0.1.0', '0.3.0'], open), {
    branch: 'changelog/0.1.0-0.17.0',
    existing: true,
  })
})

test('releases from two open pull requests fail the run', () => {
  assert.throws(() => chooseBranch(['0.3.0', '0.18.0'], open), /two open pull requests/)
})
