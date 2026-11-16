/**
 * Turns a docs page into its Markdown twin: the page's source with the MDX and Starlight-only
 * syntax (imports, tabs, asides, the components that draw generated content, root-relative
 * links) rewritten as plain Markdown, so an agent can read it on its own.
 */
import { iconEntries } from '../data/icons'
import messages from '../data/messages.json' with { type: 'json' }
import { frameworks } from '../data/snippets'

/** The absolute URL of the site, ending in a slash, for a base such as "/" or "/pr-preview/pr-1/". */
export function siteUrl(base: string): string {
  const path = base.replace(/^\/+|\/+$/g, '')
  return path ? `https://inkbar.dev/${path}/` : 'https://inkbar.dev/'
}

/** Where an entry's twin lives, relative to the site URL: "docs/quickstart" → "docs/quickstart.md". */
export function twinPath(id: string): string {
  return `${id}.md`
}

/** The note at the top of every twin, and hidden on every page, pointing agents at llms.txt. */
export function agentNote(site: string): string {
  return `For AI agents: the full Inkbar documentation index is at ${site}llms.txt. Every docs page is also available as Markdown: replace the trailing slash with \`.md\`, so ${site}docs/quickstart/ becomes ${site}docs/quickstart.md.`
}

export interface TwinEntry {
  id: string
  title: string
  description?: string
  body: string
}

// A code span, left as written, or a root-relative link target with an optional title, as in
// "](/docs/a/)" or '](/docs/a/ "Title")'; a protocol-relative "](//host/)" is not one. Matching
// code spans first keeps their text intact; a span closes only on a backtick run of its own
// length, so it can hold shorter runs.
const rootLink =
  /(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)|\]\((\/(?!\/)[^)\s]*)((?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?)\)/g

// An MDX import on one line: "import 'x'", "import X from 'x'", "import { a, b } from 'x'".
const importLine =
  /^import\s+(?:type\s+)?(?:[\w*{][^'"]*?\s+from\s+)?['"][^'"]+['"]\s*;?\s*$/
// The first line of an import whose braced list runs over several lines: "import {".
const importOpen = /^import\s+(?:type\s+)?(?:\w+\s*,\s*)?\{[^}]*$/
// The line that closes it: "} from 'x'".
const importClose = /^\s*\}\s*from\s+['"][^'"]+['"]\s*;?\s*$/

// A code fence opener or closer: up to any indent, then three or more backticks or tildes.
const fenceLine = /^\s*(`{3,}|~{3,})(.*)$/

// A line that starts a block of its own, so an aside's label can't share it.
const blockStart = /^\s*(?:([-*+]|\d+[.)])\s|#{1,6}(?:\s|$)|>|\||`{3,}|~{3,})/

const asideTitles: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  caution: 'Caution',
  danger: 'Danger',
}

function absoluteLink(path: string, site: string): string {
  const [, pathname = '', suffix = ''] = /^([^?#]*)(.*)$/s.exec(path) ?? []
  const twin =
    pathname === '/docs/' || pathname.startsWith('/docs/')
      ? `${pathname.replace(/\/$/, '')}.md`
      : pathname
  return `${site}${twin.slice(1)}${suffix}`
}

function attribute(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1]
}

function fence(lang: string, code: string): string {
  // A fence longer than any backtick run in the code, so the code cannot close it.
  const longest = Math.max(2, ...(code.match(/`+/g) ?? []).map((run) => run.length))
  const marker = '`'.repeat(longest + 1)
  return `${marker}${lang}\n${code.replace(/\n$/, '')}\n${marker}`
}

const cell = (text: string) => text.replace(/\|/g, '\\|')

/** The Markdown for a component that draws generated content, or undefined for any other line. */
function component(line: string): string | undefined {
  const tag = line.trim()
  if (/^<FrameworkSnippet\b[^>]*\/>$/.test(tag)) {
    const install = attribute(tag, 'show') === 'install'
    return frameworks
      .map((framework) =>
        install
          ? `**${framework.label}**\n\n${fence('sh', framework.install)}`
          : `**${framework.label}**, \`${framework.file}\`:\n\n${fence(framework.lang, framework.code)}`
      )
      .join('\n\n')
  }
  if (/^<IconGrid\s*\/>$/.test(tag)) {
    return [
      '| Icon | Shown by |',
      '| ---- | -------- |',
      ...iconEntries.map(([name, usedBy]) => `| \`${name}\` | ${cell(usedBy)} |`),
    ].join('\n')
  }
  if (/^<MessageKeys\s*\/>$/.test(tag)) {
    const groups = [...new Set(messages.map((message) => message.group))]
    return groups
      .map((group) =>
        [
          `### \`${group}\``,
          '',
          '| Key | English |',
          '| --- | ------- |',
          ...messages
            .filter((message) => message.group === group)
            .map(
              (message) =>
                `| \`${group}.${message.key}\`${message.kind === 'function' ? ' (function)' : ''} | ${cell(message.english)} |`
            ),
        ].join('\n')
      )
      .join('\n\n')
  }
  return undefined
}

function quote(title: string, lines: string[]): string[] {
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)?.[0].length ?? 0)
  )
  const body = lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0))
  while (body.at(0)?.trim() === '') body.shift()
  while (body.at(-1)?.trim() === '') body.pop()
  const line = (l: string) => (l === '' ? '>' : `> ${l}`)
  const [first = '', ...rest] = body
  return blockStart.test(first)
    ? [`> **${title}:**`, '>', ...body.map(line)]
    : [`> **${title}:** ${first}`, ...rest.map(line)]
}

/** The whole twin of a docs page. */
export function toMarkdown(entry: TwinEntry, site: string): string {
  const out: string[] = []
  let open: string | null = null // the marker of the code fence we are in, such as "```"
  let aside: { title: string; lines: string[] } | null = null
  let inImport = false

  const push = (...lines: string[]) => (aside?.lines ?? out).push(...lines)
  // Outside code, a blank line after a blank line (or at the start) adds nothing; dropped
  // imports and tab tags would otherwise leave runs of them.
  const pushText = (line: string) => {
    const target = aside?.lines ?? out
    if (line.trim() === '' && (target.length === 0 || target.at(-1)?.trim() === ''))
      return
    target.push(line)
  }

  for (const line of entry.body.split('\n')) {
    const [, marker, rest = ''] = fenceLine.exec(line) ?? []
    if (open === null && marker) {
      open = marker
    } else if (
      open !== null &&
      marker?.[0] === open[0] &&
      marker.length >= open.length &&
      !rest.trim()
    ) {
      open = null
    }
    if (open !== null || marker) {
      push(line)
      continue
    }

    // MDX imports: a single line, or a braced list that runs until its "} from" line. Prose
    // that happens to start with "import" matches neither shape and stays.
    if (inImport) {
      if (importClose.test(line)) inImport = false
      else if (!/^\s+[\w$]+(?:\s+as\s+[\w$]+)?,?\s*$/.test(line)) {
        throw new Error(`${entry.id}: unexpected line in an import: "${line}"`)
      }
      continue
    }
    if (importLine.test(line)) continue
    if (importOpen.test(line)) {
      inImport = true
      continue
    }

    const tag = line.trim()
    if (/^<\/?Tabs\b[^>]*>$/.test(tag) || tag === '</TabItem>') continue
    const tab = /^<TabItem\b[^>]*>$/.exec(tag)
    if (tab) {
      push(`**${attribute(tag, 'label') ?? 'Tab'}**`)
      continue
    }

    const directive = /^:::(\w+)(?:\[(.*)\])?\s*$/.exec(tag)
    const asideTag = /^<Aside\b[^>]*>$/.exec(tag)
    if (directive || asideTag) {
      // Starlight doesn't nest asides, and a nested one would lose the outer one's lines.
      if (aside) throw new Error(`${entry.id}: nested aside`)
      const type = directive ? directive[1] : (attribute(tag, 'type') ?? 'note')
      const title = directive?.[2] ?? (asideTag ? attribute(tag, 'title') : undefined)
      if (!(type in asideTitles))
        throw new Error(`${entry.id}: unsupported aside ${type}`)
      aside = { title: title ?? asideTitles[type], lines: [] }
      continue
    }
    if (aside && (tag === ':::' || tag === '</Aside>')) {
      out.push(...quote(aside.title, aside.lines))
      aside = null
      continue
    }

    const generated = component(line)
    if (generated !== undefined) {
      push(generated)
      continue
    }
    if (/^<[A-Z]/.test(tag)) {
      throw new Error(`${entry.id}: no Markdown for the component in "${tag}"`)
    }

    pushText(
      line.replace(
        rootLink,
        (match, code: string | undefined, path: string, title: string) =>
          code ? match : `](${absoluteLink(path, site)}${title})`
      )
    )
  }
  if (aside) throw new Error(`${entry.id}: unterminated aside`)
  if (inImport) throw new Error(`${entry.id}: unterminated import`)

  const parts = [`# ${entry.title}`, `> ${agentNote(site)}`]
  if (entry.description) parts.push(entry.description)
  const body = out.join('\n').trim()
  if (body) parts.push(body)
  return `${parts.join('\n\n')}\n`
}
