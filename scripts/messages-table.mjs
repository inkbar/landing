/**
 * Writes src/data/messages.json, the table the Translations guide renders as its key
 * reference: one row per message with its group, key and English text.
 *
 * The landing site does not depend on @inkbar/core, so the table is generated, not imported
 * at build time. To regenerate it after core's English messages change:
 *
 *   pnpm --filter @inkbar/core build      # in the inkbar repo, if packages/core/dist is missing
 *   pnpm messages:table [path/to/packages/core/dist/locales/en.mjs]
 *   (the same as: node scripts/messages-table.mjs [path])
 *
 * The default path is ../inkbar/packages/core/dist/locales/en.mjs. Commit the result.
 * A function message shows its template, or its plural forms, from the function's `source`.
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const entry = resolve(process.argv[2] ?? '../inkbar/packages/core/dist/locales/en.mjs')
/**
 * @typedef {{ text?: string, forms?: Record<string, string> }} Source
 * @typedef {string | (((params: never) => string) & { source?: Source })} Message
 * @typedef {{ en: Record<string, string | Record<string, Message>> }} Locale
 */

// The built file has no types, so the import is cast to Locale.
/** @type {Locale} */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const locale = await import(pathToFileURL(entry).href)
const en = locale.en

/** @param {Message} value */
function describe(value) {
  if (typeof value === 'string') return value
  const source = value.source
  if (source?.text !== undefined) return source.text
  if (source?.forms) {
    return Object.entries(source.forms)
      .map(([category, text]) => `${category}: ${text}`)
      .join(' | ')
  }
  throw new Error('A function message has no source')
}

const rows = []
for (const [group, keys] of Object.entries(en)) {
  if (typeof keys === 'string') continue
  for (const [key, value] of Object.entries(keys)) {
    rows.push({
      group,
      key,
      kind: typeof value === 'function' ? 'function' : 'text',
      english: describe(value),
    })
  }
}

writeFileSync(
  new URL('../src/data/messages.json', import.meta.url),
  `${JSON.stringify(rows, null, 2)}\n`
)
console.log(`Wrote ${rows.length} messages`)
