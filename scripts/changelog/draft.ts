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

import { chooseBranch } from './branch.ts'
import { githubGet, listReleases, openPrBranches } from './github.ts'
import { type NotesClient, notesFile } from './notes.ts'
import { prBody } from './pr-body.ts'
import { draftReleases } from './run.ts'
import { type Finding, scanNotes } from './scan.ts'
import { resolveVersions } from './versions.ts'

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
  const openPrs = await openPrBranches(get)
  const targets = resolveVersions(
    { versions: values.versions, trigger },
    releases,
    onMain,
    new Set(openPrs.keys())
  )
  const versions = targets.map(({ version }) => version)
  if (versions.length === 0) {
    console.log('Nothing to draft')
    if (!values.stdout) writeRun({ versions })
    return
  }
  // Chosen before drafting, so a run that can't be placed spends nothing.
  const { branch, existing } = chooseBranch(versions, openPrs)

  const anthropic = new Anthropic()
  const client: NotesClient = {
    beta: { messages: { create: (request) => anthropic.beta.messages.create(request) } },
  }
  // Draft everything before writing anything, so a failure leaves no partial set.
  const drafts = await draftReleases(get, client, versions, releases)

  if (values.stdout) {
    for (const { version, notes } of drafts) {
      console.log(`## ${version}\n\n${notes}\n`)
      for (const { line, rule, match } of scanNotes(notes)) {
        console.error(`${version} line ${line}: ${rule} "${match}"`)
      }
    }
    return
  }
  const findings = new Map<string, Finding[]>()
  for (const { version, date, notes } of drafts) {
    writeFileSync(new URL(`${version}.md`, changelogDir), notesFile(version, date, notes))
    const found = scanNotes(notes)
    if (found.length > 0) findings.set(version, found)
  }
  const range =
    versions.length === 1 ? versions[0] : `${versions[0]} to ${versions.at(-1)}`
  writeRun({
    versions,
    branch,
    existing,
    title:
      versions.length === 1
        ? `docs: ${existing ? 'redraft' : 'add'} the ${range} changelog`
        : `docs: ${existing ? 'redraft' : 'add'} changelogs for ${range}`,
    body: prBody(findings, versions),
  })
}

interface Run {
  versions: string[]
  branch?: string
  existing?: boolean
  title?: string
  body?: string
}

function writeRun(run: Run): void {
  writeFileSync(runFile, JSON.stringify(run, null, 2) + '\n')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
