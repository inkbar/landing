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

`createViewer` opens a document and renders it into an element, with a thread popover for notes and text markup. You build the toolbars from controls that use the same markup as the framework packages, so `@inkbar/theme` styles them.

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
  createToolButton(viewer, 'select-text'),
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

`createViewer` takes the [`mountViewer` options](#your-own-chrome) except `container` and `document`, plus `source` and `assets` (both required), `password`, `defaults`, `history`, `plugins`, `onReady` and `onError`. Set `threads` to `false` to leave threads out. `viewer.status`, `viewer.document`, `viewer.engine`, `viewer.viewport` and `viewer.tools` are readables; the last two change when the engine rebuilds. `viewer.activated` is a readable too: the id of the annotation the user last clicked or activated with Enter or Space, or `null`. `viewer.setActivated(id)` activates one from your code without calling `onActivate`. It ignores an id the document doesn't have, and `setActivated(null)` clears it. A password you pass to `open` replaces the `createViewer` one for that load.

`plugins` takes plugins from `definePlugin`, set up once for the viewer's life. Place a plugin command with `createCommandButton(viewer, 'review.suggest')` and a plugin tool with `createToolButton(viewer, 'review.box')`. `viewer.commands.get(id)` returns a command for a control of your own. [Plugins](/docs/guides/plugins/) has the details.

`createSearchButton(viewer)` opens the find bar from `createFindBar(viewer)`, which you append to `[data-ink-viewport-root]`. `viewer.search` holds the search state and actions. [Search](/docs/guides/search/) has the details.

The viewer fills the PDF's form fields and runs the form's scripts. `viewer.form` is a readable that holds the open document's form, or `null` before one is ready. `onFormAction` receives each submit, link, mail and print request, since the form never acts on them itself. `formHighlight: false` turns off the field tint, and `viewer.setFormHighlight(on)` changes it later. [Forms](/docs/guides/forms/) has the details.

`createSignatureMenu(viewer)` lists the saved signatures and turns on the `signature` tool with the chosen one. Pass `signatures` and `signatureFonts` to `createViewer` to say where templates live and which handwriting fonts the dialog offers. [Signatures](/docs/guides/signatures/) has the details.

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
- `decorateAnnotation(annotation)` returns your own `data`, `classes` and `description` for an annotation's element, or `undefined`. `{ data: { 'my-flag': 'on' } }` writes `data-my-flag="on"`, and `description` becomes the element's `aria-description`. Data keys are lower-case kebab case. Inkbar applies them again whenever the annotations change. Call `engine.redecorate()` when they depend on anything else. Core's own attributes and `ink-` classes always win.
- `onActivate(id)` fires when the user activates an annotation.
- `onBuild(viewport, tools)` fires after every build, the first one included, before `mountViewer` returns. Subscribe to the new viewport and tool controller here.
- `onPageMount(page, mount, host)` and `onPageUnmount(page)` fire as pages enter and leave the mounted range.
- `onPageError(page, error)` reports a page whose canvas or text layer failed, and `onPageError(page, null)` once every failed layer renders again. Unmounting a failed page emits no `null`, so clear any per-page error in `onPageUnmount`.

The viewport mounts pages synchronously, so a build's page callbacks fire before its `onBuild`. During a rebuild, `engine.viewport` and `engine.tools` still point at the destroyed objects while those callbacks run. Read the arguments instead, or wait for `onBuild`.

## Your own popovers

`decorateAnnotation` tags your marks, and `createPopover` opens your own card next to one. The panel goes on `<body>` with `role="dialog"` and `data-ink-popover`, so `@inkbar/theme` gives it the viewer's colour tokens. It follows the annotation's element as pages mount and unmount, hiding while the page is gone. Tab stays inside the panel. Escape pressed in the panel or the viewer calls your `onDismiss`, as does a press outside the panel. A press on another annotation hands over to it instead.

```ts
import { createFocusReturn, createPopover, createViewer } from '@inkbar/core/dom'

const viewer = createViewer(el, {
  source: file,
  assets,
  decorateAnnotation: (a) =>
    a.custom?.review === 'open'
      ? { data: { review: 'open' }, description: 'Needs review' }
      : undefined,
})
const root = viewer.element // the [data-ink-root] element

const focusReturn = createFocusReturn({
  root: () => root,
  activated: () => viewer.activated.get(),
})
const card = createPopover({
  root,
  attrs: { class: 'review-card', 'aria-label': 'Review' },
  focusReturn,
  onDismiss: () => viewer.setActivated(null),
})

viewer.activated.subscribe((id) => {
  const a = id ? viewer.document.get()?.annotations.get(id) : undefined
  if (a?.custom?.review !== 'open') return card.hide()
  card.panel.textContent = a.contents ?? 'No comment'
  card.show(a.id)
})
```

Style the marks from the attributes you set, for example `[data-annotation][data-review="open"]`.

- `createFocusReturn({ root, activated })` decides where focus goes when the panel hides: back to the annotation, or to the next one on the page when you removed it. Call `focusReturn.beforeRemove(card.anchor)` just before you remove the anchored annotation. Its optional second argument is a selector, such as `'[data-review]'`, that sends focus to the next of your own marks first.
- `card.anchor` is the anchored annotation's element, or `null` while its page is unmounted. `card.destroy()` removes the panel and its listeners.
- `placePanel(panel, rect)` positions a fixed panel below a `DOMRect`, or above it when only that fits, inside the window. Use it for a panel anchored to something other than an annotation.
- `observeAnnotationElement(root, id, onChange)` calls `onChange` with the element for annotation `id` now and whenever it changes, and returns a function that stops observing. `createPopover` uses it to follow the anchor.

For a complete example extension, see the sandbox's [review card](https://github.com/inkbar/inkbar/blob/main/apps/sandbox/src/shared/suggestion-card.ts). It builds on these APIs and keeps its own data under `custom.sandbox`.

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
