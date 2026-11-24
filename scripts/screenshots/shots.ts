// The screenshots on the use-case pages: which sample document each opens and which tools its
// toolbar offers. run.ts drives each one to its state and saves it.

export type ToolName = 'highlight' | 'note' | 'redact-area' | 'signature'

export interface Shot {
  slug: 'redact-pdfs' | 'fill-pdf-forms' | 'sign-pdfs' | 'review-pdfs'
  /** A made-up sample in documents/. The README says where each one comes from. */
  document: string
  tools: ToolName[]
  /** Loads @inkbar/engine, which the apply-redactions dialog needs. */
  engine: boolean
}

export const shots: Shot[] = [
  {
    slug: 'redact-pdfs',
    document: 'redactions.pdf',
    tools: ['redact-area'],
    engine: true,
  },
  { slug: 'fill-pdf-forms', document: 'application.pdf', tools: [], engine: false },
  { slug: 'sign-pdfs', document: 'letter.pdf', tools: ['signature'], engine: false },
  {
    slug: 'review-pdfs',
    document: 'handbook.pdf',
    tools: ['highlight', 'note'],
    engine: false,
  },
]

export function shotUrl(base: string, shot: Shot): string {
  return `${base}?shot=${shot.slug}`
}
