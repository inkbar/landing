import assert from 'node:assert/strict'
import { test } from 'node:test'

import { cleanReply, draftNotes, notesFile, type NotesClient } from './notes.ts'
import { LAUNCH_PROMPT, SYSTEM_PROMPT } from './prompt.ts'

function fakeClient(reply: { stop_reason: string; text: string }) {
  const requests: Record<string, unknown>[] = []
  const client: NotesClient = {
    beta: {
      messages: {
        create: (request: Record<string, unknown>) => {
          requests.push(request)
          return Promise.resolve({
            stop_reason: reply.stop_reason,
            content: [{ type: 'text', text: reply.text }],
          })
        },
      },
    },
  }
  return { client, requests }
}

const change = { subject: 'feat: add x (#12)', body: '' }

test('a release with nothing left to describe never calls Claude', async () => {
  const { client, requests } = fakeClient({ stop_reason: 'end_turn', text: 'x' })
  assert.equal(
    await draftNotes(client, '0.1.1', [], false),
    'Small fixes and improvements.'
  )
  assert.equal(requests.length, 0)
})

test('draftNotes asks claude-opus-5-5 at low effort with fallbacks', async () => {
  const { client, requests } = fakeClient({
    stop_reason: 'end_turn',
    text: '### New\n\n- X.',
  })
  assert.equal(await draftNotes(client, '0.2.0', [change], false), '### New\n\n- X.')
  const [request] = requests
  assert.equal(request?.model, 'claude-opus-5-5')
  assert.deepEqual(request?.output_config, { effort: 'low' })
  assert.deepEqual(request?.betas, ['server-side-fallback-2026-07-01'])
  assert.equal(request?.fallbacks, 'default')
  assert.equal(request?.system, SYSTEM_PROMPT)
})

test('the first release uses the launch prompt', async () => {
  const { client, requests } = fakeClient({
    stop_reason: 'end_turn',
    text: 'Inkbar is here.',
  })
  await draftNotes(client, '0.1.0', [change], true)
  assert.equal(requests[0]?.system, LAUNCH_PROMPT)
})

test('a refusal or an empty reply fails the draft', async () => {
  await assert.rejects(
    draftNotes(
      fakeClient({ stop_reason: 'refusal', text: '' }).client,
      '0.2.0',
      [change],
      false
    ),
    /refused/
  )
  await assert.rejects(
    draftNotes(
      fakeClient({ stop_reason: 'end_turn', text: '  ' }).client,
      '0.2.0',
      [change],
      false
    ),
    /empty/
  )
})

test('cleanReply strips one wrapping fence and rejects a title', () => {
  assert.equal(cleanReply('```markdown\n### New\n- x\n```'), '### New\n- x')
  assert.throws(() => cleanReply('## 0.18.0\n\n- x'), /title/)
  assert.throws(() => cleanReply('# Release notes\n\n- x'), /title/)
})

test('notesFile writes the frontmatter and the notes', () => {
  assert.equal(
    notesFile('0.18.0', '2026-11-24', 'x'),
    '---\nversion: 0.18.0\ndate: 2026-11-24\n---\n\nx\n'
  )
})
