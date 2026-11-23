// Flags wording in drafted notes that shouldn't reach the changelog page. A match is for Ed to
// check in the pull request; it doesn't fail the run.

export interface Finding {
  line: number
  rule: string
  match: string
}

const rules: [rule: string, pattern: RegExp][] = [
  ['pr-number', /#\d+/],
  // Seven or more hex characters with at least one digit, so words like "defaced" pass.
  ['hash', /\b(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/],
  ['dash', /[—–]/],
  ['plan-label', /\b(1a|1b|Track [AB]|sub-project|milestone)\b/i],
  ['ai', /\bAI\b/],
  // cubic the reviewer, not a cubic Bézier curve.
  ['vendor', /\b(BrowserStack|Cloudflare|GitHub Actions|cubic(?! B[ée]zier))\b/i],
  ['html', /<[a-z][\w-]*(?=[\s>/]|$)/i],
  // The page adds the one link a release needs; Astro would turn a bare URL into another.
  ['link', /\]\(|https?:\/\//],
]

export function scanNotes(notes: string): Finding[] {
  const findings: Finding[] = []
  notes.split('\n').forEach((text, index) => {
    // Code formatting shows a tag as text, so the html rule reads the line without code spans.
    const prose = text.replace(/(`+)[\s\S]*?\1/g, '')
    for (const [rule, pattern] of rules) {
      const match = pattern.exec(rule === 'html' ? prose : text)?.[0]
      if (match) findings.push({ line: index + 1, rule, match })
    }
  })
  return findings
}
