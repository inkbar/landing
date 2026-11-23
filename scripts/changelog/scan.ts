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
  ['vendor', /\b(BrowserStack|Cloudflare|cubic|GitHub Actions)\b/i],
  ['html', /<[a-z][\w-]*[\s>/]/i],
]

export function scanNotes(notes: string): Finding[] {
  const findings: Finding[] = []
  notes.split('\n').forEach((text, index) => {
    for (const [rule, pattern] of rules) {
      const match = pattern.exec(text)?.[0]
      if (match) findings.push({ line: index + 1, rule, match })
    }
  })
  return findings
}
