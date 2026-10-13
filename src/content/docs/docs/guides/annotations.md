---
title: Annotations
description: Open a document, add annotations, listen for changes and drive the tools from the keyboard.
---

## Usage

```ts
import { openDocument } from '@inkbar/core'
import { assets } from 'virtual:inkbar-assets' // from the Vite plugin, see Loading assets

const doc = await openDocument(file, { assets })
await doc.ready

doc.annotations.add({ type: 'highlight', page: 0, quads })
const json = doc.exportAnnotations('json')
```

`file` can be a `File`, `Blob`, `Uint8Array`, a URL string, or `{ url, key }` when the URL is signed and changes between loads. `quads` is a list of quads in PDF user space.

Writing annotations back into the PDF needs `@inkbar/engine`, which is not released yet. Until then `save()` rejects with `EngineUnavailable`. Persist `exportAnnotations('json')` instead and re-import it on the next open.

## Annotation changes

`doc.annotations.on('change', fn)`, and `onChange(next, change)` in controlled mode, describe each mutation:

- `{ kind: 'add', annotation }`
- `{ kind: 'update', id, before, after }`
- `{ kind: 'remove', annotation, removed }`. Removing a note also removes its replies, so `removed` lists everything that went: `annotation` first, then the replies. A host that syncs by change should delete every id in `removed`.
- `{ kind: 'replace', reason }` for an import, a history step or a controlled sync. Read the whole list.

`add` throws if `input.id` is already in the list. Locked annotations refuse changes to their geometry, `page` and `contents`.

## Tools and keyboard

`createToolController` from `@inkbar/core/dom` routes pointer and key events on the viewport to the active tool: `view`, `select`, `highlight`, `redact-area` or `note`. Every tool works from the keyboard as well as the pointer.

| Where focus is               | Key                                 | Effect                                                                                              |
| ---------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Viewport, `highlight` tool   | `Enter`                             | Turns the text selection into a highlight                                                           |
| Viewport, `redact-area` tool | `Enter`                             | Turns the text selection into text redactions                                                       |
| Viewport, `note` tool        | `Enter`                             | Places a note at the centre of the current page and focuses it                                      |
| Viewport                     | `+` or `=`, `-`                     | Zoom in, zoom out                                                                                   |
| Viewport                     | `Home`, `End`, `PageUp`, `PageDown` | First, last, previous, next page                                                                    |
| Annotation                   | `Enter` or `Space`                  | Selects and activates it                                                                            |
| Annotation                   | `ArrowUp`, `ArrowDown`              | Previous or next annotation on the page, in reading order                                           |
| Annotation                   | `Shift` + arrow                     | Moves it 1 pt (`Shift` + `Alt` + arrow: 10 pt)                                                      |
| Annotation                   | `Ctrl` or `Cmd` + `Shift` + arrow   | Resizes an area redaction, text box or shape by 1 pt. Right and Down grow it, Left and Up shrink it |
| Annotation                   | `Delete` or `Backspace`             | Removes it                                                                                          |
| Annotation                   | `Escape`                            | Clears the selection                                                                                |

The tool controller and the overlay handle the tool and annotation keys. The zoom and page keys (`+`, `=`, `-`, `Home`, `End`, `PageUp`, `PageDown`) come from `attachViewportKeys`, which the tool controller does not install. Attach it to the same container:

```ts
import { attachViewportKeys } from '@inkbar/core/dom'

const detach = attachViewportKeys(container, {
  viewport,
  pageCount: () => doc.pages.length,
})
// later: detach()
```

On a focused annotation, `Enter` or `Space` selects it and calls `onActivate`; what activation opens is up to the host.

Locked annotations, such as those embedded in the file, ignore move, resize and delete. Without a text selection, `Enter` in the `highlight` and `redact-area` tools does nothing.

`redact-area` draws an area mark when you drag. To redact text instead, select the text with the `view` tool, switch to `redact-area`, then click inside the selection or press `Enter`. The tool keeps the press from starting a new text selection, so it cannot select text itself.

With the `select` tool, a selected area redaction, text box or shape shows four corner handles (`.ink-handle[data-handle="nw|ne|sw|se"]`). Dragging one resizes it; the store records a single update on release. Drag the annotation itself to move it.
