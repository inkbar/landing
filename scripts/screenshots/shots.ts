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

export type Device = 'desktop' | 'phone'

/**
 * The screens each shot is captured on. The phone's height is a phone screen less the status
 * bar and the browser's address bar, which the page's phone frame draws round it.
 */
export const devices: Record<
  Device,
  {
    viewport: { width: number; height: number }
    deviceScaleFactor: number
    isMobile: boolean
    hasTouch: boolean
  }
> = {
  desktop: {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  },
  phone: {
    viewport: { width: 390, height: 728 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
}

export function shotUrl(base: string, shot: Shot, device: Device = 'desktop'): string {
  return `${base}?shot=${shot.slug}${device === 'phone' ? '&device=phone' : ''}`
}

/** The file in src/assets/use-cases/ a shot is saved to. */
export function imageName(slug: Shot['slug'], device: Device): string {
  return device === 'phone' ? `${slug}-phone.png` : `${slug}.png`
}
