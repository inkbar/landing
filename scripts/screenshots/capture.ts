// The page each screenshot is taken of: a viewer from the released packages, with only the
// tools its shot needs, on that shot's sample document. run.ts drives it from here.
/// <reference types="@inkbar/core/vite/client" />
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
  }
}

const factories = {
  highlight: highlightTool,
  note: noteTool,
  'redact-area': redactAreaTool,
  signature: signatureTool,
} satisfies Record<ToolName, () => unknown>

const query = new URLSearchParams(location.search)
const slug = query.get('shot')
const shot = shots.find((candidate) => candidate.slug === slug)
if (!shot) throw new Error(`No shot named ${slug}`)

const source = new Uint8Array(await (await fetch(`/${shot.document}`)).arrayBuffer())
const viewer = createViewer(document.getElementById('viewer')!, {
  source,
  assets,
  // On a phone the page fills the screen's width, as a person would read it.
  zoom: query.get('device') === 'phone' ? 'fit-width' : 1.25,
  tools: shot.tools.map((tool) => factories[tool]()),
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
