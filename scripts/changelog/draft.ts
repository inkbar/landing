// Drafts changelog notes for Inkbar releases with Claude.
//
//   pnpm changelog:draft --versions 0.18.0 [--trigger dispatch|manual] [--stdout]
//
// --versions takes a version, a comma-separated list, or "missing" (every release with no
// notes on main or in an open pull request). Named versions are redrafted; a dispatch and
// "missing" never overwrite. --stdout prints the notes instead of writing files, for trying
// prompt changes. GITHUB_TOKEN must be set. Claude is reached through Workload Identity
// Federation in CI, or an `ant auth login` profile locally.

import { readdirSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

import Anthropic from '@anthropic-ai/sdk'

import { collectChanges, githubGet, listReleases, openPrVersions } from './github.ts'
import { draftNotes, type NotesClient, notesFile } from './notes.ts'
import { prBody } from './pr-body.ts'
import { type Finding, scanNotes } from './scan.ts'
import { previousVersion, resolveVersions } from './versions.ts'

const changelogDir = new URL('../../src/content/changelog/', import.meta.url)
const runFile = new URL('../../changelog-run.json', import.meta.url)

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      versions: { type: 'string' },
      trigger: { type: 'string', default: 'manual' },
      stdout: { type: 'boolean', default: false },
    },
  })
  const trigger = values.trigger
  if (!values.versions) throw new Error('Pass --versions')
  if (trigger !== 'manual' && trigger !== 'dispatch') {
    throw new Error('--trigger is manual or dispatch')
  }
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('Set GITHUB_TOKEN')

  const get = githubGet(token)
  const releases = await listReleases(get)
  const onMain = new Set(
    readdirSync(changelogDir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.slice(0, -'.md'.length))
  )
  const targets = resolveVersions(
    { versions: values.versions, trigger },
    releases,
    onMain,
    await openPrVersions(get)
  )
  if (targets.length === 0) {
    console.log('Nothing to draft')
    if (!values.stdout) writeRun([], false, '')
    return
  }

  const anthropic = new Anthropic()
  const client: NotesClient = {
    beta: { messages: { create: (request) => anthropic.beta.messages.create(request) } },
  }
  // Draft everything before writing anything, so a failure leaves no partial set.
  const drafts: { version: string; date: string; notes: string }[] = []
  for (const { version } of targets) {
    const base = previousVersion(version, releases)
    const changes = await collectChanges(get, base, version)
    const notes = await draftNotes(client, version, changes, base === null)
    const release = releases.find((candidate) => candidate.version === version)
    drafts.push({ version, date: (release?.publishedAt ?? '').slice(0, 10), notes })
    console.error(`Drafted ${version} from ${changes.length} commits`)
  }

  if (values.stdout) {
    for (const { version, notes } of drafts) console.log(`## ${version}\n\n${notes}\n`)
    return
  }
  const findings = new Map<string, Finding[]>()
  for (const { version, date, notes } of drafts) {
    writeFileSync(new URL(`${version}.md`, changelogDir), notesFile(version, date, notes))
    const found = scanNotes(notes)
    if (found.length > 0) findings.set(version, found)
  }
  const versions = drafts.map(({ version }) => version)
  writeRun(
    versions,
    targets.some(({ overwrite }) => overwrite),
    prBody(findings, versions)
  )
}

function writeRun(versions: string[], overwrite: boolean, body: string): void {
  writeFileSync(runFile, JSON.stringify({ versions, overwrite, body }, null, 2) + '\n')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
