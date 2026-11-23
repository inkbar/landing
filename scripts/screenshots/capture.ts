// The page each screenshot is taken of: a viewer from the released packages, with only the
// tools its shot needs, on that shot's sample document. run.ts drives it from here.
/// <reference types="@inkbar/core/vite/client" />
import { placeSignature } from '@inkbar/core'
import {
  createApplyRedactionsButton,
  createSignatureMenu,
  createToolbar,
  createToolButton,
  createViewer,
  highlightTool,
  noteTool,
  redactAreaTool,
  signatureTool,
  type Viewer,
} from '@inkbar/core/dom'
import '@fontsource-variable/open-sans/index.css'
import '@inkbar/theme/theme.css'
import { assets } from 'virtual:inkbar-assets'

import { shots, type ToolName } from './shots.ts'

declare global {
  interface Window {
    viewer: Viewer
    placeSignature: typeof placeSignature
  }
}

const factories = {
  highlight: highlightTool,
  note: noteTool,
  'redact-area': redactAreaTool,
  signature: signatureTool,
} satisfies Record<ToolName, () => unknown>

const slug = new URLSearchParams(location.search).get('shot')
const shot = shots.find((candidate) => candidate.slug === slug)
if (!shot) throw new Error(`No shot named ${slug}`)

const source = new Uint8Array(await (await fetch(`/${shot.document}`)).arrayBuffer())
const viewer = createViewer(document.getElementById('viewer')!, {
  source,
  assets,
  zoom: 1.25,
  tools: shot.tools.map((tool) => factories[tool]()),
  ...(shot.engine ? { engine: () => import('@inkbar/engine') } : {}),
})

const bar = createToolbar()
bar.append(createToolButton(viewer, 'select-text'), createToolButton(viewer, 'select'))
for (const tool of shot.tools) {
  if (tool === 'signature') bar.append(createSignatureMenu(viewer))
  else bar.append(createToolButton(viewer, tool))
}
if (shot.tools.includes('redact-area')) bar.append(createApplyRedactionsButton(viewer))
viewer.element.prepend(bar)

window.viewer = viewer
window.placeSignature = placeSignature
