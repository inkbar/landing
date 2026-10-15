---
title: Plain DOM
description: Use Inkbar without a framework package, with createViewer and its toolbar controls, or mountViewer for your own chrome.
---

`@inkbar/core` has three entry points:

- `@inkbar/core` holds the document model and annotation store. It is safe to import during server rendering.
- `@inkbar/core/dom` renders pages, text layers and annotation layers into the DOM.
- `@inkbar/core/vite` is a Vite plugin that serves the PDF.js assets.

Install `@inkbar/core` and `@inkbar/theme`, and set up the assets as [Loading assets](/docs/loading-assets/) describes.

## The whole viewer

`createViewer` opens a document and renders it into an element, with a note thread and a suggested-redaction card. You build the toolbars from controls that use the same markup as the framework packages, so `@inkbar/theme` styles them.

```ts
import {
  createViewer,
  createToolbar,
  createToolButton,
  createToolbarSeparator,
  createUndo,
  createRedo,
  createPrevPage,
  createPageInput,
  createPageCount,
  createNextPage,
  createZoomSelect,
} from '@inkbar/core/dom'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

const viewer = createViewer(el, { source: file, assets, zoom: 'fit-width' })

const tools = createToolbar()
tools.append(
  createToolButton(viewer, 'view'),
  createToolButton(viewer, 'select'),
  createToolButton(viewer, 'highlight'),
  createToolButton(viewer, 'redact-area'),
  createToolButton(viewer, 'note'),
  createToolbarSeparator(),
  createUndo(viewer),
  createRedo(viewer)
)

const pages = createToolbar({ label: 'Page and zoom' })
pages.append(
  createPrevPage(viewer),
  createPageInput(viewer),
  createPageCount(viewer),
  createNextPage(viewer),
  createZoomSelect(viewer)
)

viewer.element.prepend(tools) // above the document
viewer.element.append(pages) // below it

viewer.open(otherFile) // destroys the current document; the latest call wins
viewer.open(lockedFile, { password }) // this password applies to this load only
viewer.destroy()
```

Each control disables itself while no document is ready and lives as long as its viewer. `createZoomIn` and `createZoomOut` are there too. `createToolButton` takes `{ label }` as a third argument to rename a tool.

Buttons show an icon from `@inkbar/icons`; replace their children with your own icon and the accessible name stays. `createIcon` draws any `@inkbar/icons` icon for your own buttons.

`createToolbar` gives one Tab stop to all its buttons, with arrow keys between them. A button you append joins that order. An input, select or textarea you add keeps its arrow keys and its own `tabindex`: it is a Tab stop unless you give it `tabindex="-1"`.

`createViewer` takes the [`mountViewer` options](#your-own-chrome) except `container` and `document`, plus `source` and `assets` (both required), `password`, `defaults`, `history`, `onReady` and `onError`. Set `notes` or `suggestions` to `false` to leave that part out. `viewer.status`, `viewer.document`, `viewer.engine`, `viewer.viewport` and `viewer.tools` are readables; the last two change when the engine rebuilds. A password you pass to `open` replaces the `createViewer` one for that load.

`createViewer` reads the theme's colours from the element you pass, so that element needs to be in the page when you call it. Like the framework packages, the viewer fills its parent, so give the element a height.

## Your own chrome

`mountViewer` wires the viewport, page layers, tools, and zoom and page keys onto a scroll container. You render everything around it.

```ts
import { openDocument } from '@inkbar/core'
import { mountViewer } from '@inkbar/core/dom'

const doc = await openDocument(file, { assets })
await doc.ready

const engine = mountViewer({
  container, // a focusable, scrollable element
  document: doc,
  zoom: 'fit-width',
  onPageError: (page, error) => console.warn(page, error),
})
engine.tools.set('highlight')
engine.viewport.setZoom(1.5)
engine.viewport.scrollToPage(4)
engine.rebuild({ gap: 32 }) // construction-only options; zoom, page, tool and scroll position carry over
engine.destroy()
```

Options:

- `container` and `document`, both required.
- `zoom` (a number, `'fit-width'` or `'fit-page'`; default `'fit-width'`), `page`, `mode` (`'continuous'` or `'single'`), `rotation` (0, 90, 180 or 270) and `tool` set the starting view. Change them later through `engine.viewport` and `engine.tools`.
- `gap`, `buffer` and `customAnnotations` are fixed for a build. Change them with `engine.rebuild`.
- `onActivate(id)` fires when the user activates an annotation.
- `onBuild(viewport, tools)` fires after every build, the first one included, before `mountViewer` returns. Subscribe to the new viewport and tool controller here.
- `onPageMount(page, mount, host)` and `onPageUnmount(page)` fire as pages enter and leave the mounted range.
- `onPageError(page, error)` reports a page whose canvas or text layer failed, and `onPageError(page, null)` once every failed layer renders again. Unmounting a failed page emits no `null`, so clear any per-page error in `onPageUnmount`.

The viewport mounts pages synchronously, so a build's page callbacks fire before its `onBuild`. During a rebuild, `engine.viewport` and `engine.tools` still point at the destroyed objects while those callbacks run. Read the arguments instead, or wait for `onBuild`.

## The document model on its own

`openDocument` works without any DOM, for example to read annotations or page text:

```ts
import { openDocument } from '@inkbar/core'

const doc = await openDocument(file, { assets })
await doc.ready

doc.annotations.add({ type: 'highlight', page: 0, quads })
const json = doc.exportAnnotations('json')
```

[Annotations](/docs/guides/annotations/) covers the store, saving and the keyboard.
