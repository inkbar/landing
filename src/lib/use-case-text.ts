/**
 * Text helpers for the use-case pages, whose copy lives in frontmatter so the template can lay
 * it out. Plain TypeScript with no imports, so the unit tests run it under Node.
 */

const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

/**
 * One line of copy as HTML: `code` spans and [links](/path/) only, everything else escaped.
 * `url` prefixes root-relative links with the site's base.
 */
export function inline(text: string, url: (path: string) => string): string {
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g
  let html = ''
  let last = 0
  for (const match of text.matchAll(pattern)) {
    html += escape(text.slice(last, match.index))
    const [, code, label, href] = match
    if (code !== undefined) {
      html += `<code>${escape(code)}</code>`
    } else if (label !== undefined && href !== undefined) {
      const target = href.startsWith('/') ? url(href) : href
      html += `<a href="${escape(target)}">${escape(label)}</a>`
    }
    last = match.index + match[0].length
  }
  return html + escape(text.slice(last))
}

/** A heading with one [marked] phrase, split so the template can mark that phrase up. */
export function splitHeading(heading: string): {
  before: string
  marked: string
  after: string
} {
  const marks = [...heading.matchAll(/\[([^\]]+)\]/g)]
  const [mark] = marks
  if (marks.length !== 1 || !mark) {
    throw new Error(`The heading "${heading}" needs exactly one [marked] phrase`)
  }
  return {
    before: heading.slice(0, mark.index),
    marked: mark[1],
    after: heading.slice(mark.index + mark[0].length),
  }
}
