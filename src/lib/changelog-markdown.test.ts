import assert from 'node:assert/strict'
import { test } from 'node:test'

import { changelogMarkdown } from './changelog-markdown.ts'

test('changelogMarkdown lists releases newest first, each with its GitHub link', () => {
  const markdown = changelogMarkdown(
    [
      { data: { version: '0.16.0', date: new Date('2026-11-18') }, body: 'Small fixes.' },
      {
        data: { version: '0.17.0', date: new Date('2026-11-19') },
        body: 'Apply redactions.\n\n### New\n\n- A thing.',
      },
    ],
    'Note for agents.'
  )
  assert.equal(
    markdown,
    [
      '# Inkbar changelog',
      '> Note for agents.',
      '## 0.17.0 (19 November 2026)',
      'Apply redactions.',
      '### New',
      '- A thing.',
      '[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.17.0)',
      '## 0.16.0 (18 November 2026)',
      'Small fixes.',
      '[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.16.0)\n',
    ].join('\n\n')
  )
})
