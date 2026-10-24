---
title: Annotations
description: Which annotations Inkbar creates and displays, how to save them, how to follow changes and how the tools work from the keyboard.
---

Annotations are plain typed objects. Every coordinate is in PDF user space: points, origin bottom-left, before the page's `/Rotate`. The numbers stay the same at any zoom, rotation or screen size.

## Types

The model knows 16 annotation types. Every one displays, whether it comes from a tool, your own code, a JSON import or the PDF itself.

| Type                                 | Created by                                                       |
| ------------------------------------ | ---------------------------------------------------------------- |
| `highlight`                          | The `highlight` tool                                             |
| `underline`, `strikeout`, `squiggly` | The `highlight` tool, with the kind picked in `InkHighlightMenu` |
| `redact`                             | The `redact-area` tool                                           |
| `text` (a note)                      | The `note` tool                                                  |
| `ink`                                | The `draw` and `sketch` tools, and a drawn signature             |
| `square`, `circle`                   | The `shape` tool's rectangles and ellipses, and `sketch`         |
| `line`, `polyline`                   | The `shape` tool's lines and arrows, and `sketch`                |
| `polygon`                            | The `shape` tool's stars and polygons, and `sketch`              |
| `freetext`                           | The `freetext` tool, and the `shape` tool's speech bubble        |
| `loupe`, `mask`                      | The `shape` tool                                                 |
| `stamp`                              | The `signature` tool, for a typed or uploaded signature          |

[Drawing](/docs/guides/drawing/) covers the drawing tools and [Signatures](/docs/guides/signatures/) the signature tool.

Each annotation has an `id`, a 0-based `page`, a bounding `rect`, a `#RRGGBB` `color` and an `opacity`. Optional fields are `author`, `contents`, `inReplyTo` for note replies, and `custom` for your own data. Inkbar keeps `custom` as it is, except the `inkbar` key, which it writes and reads itself. Keep your own data under a key of your own, such as `custom.myapp`.

## Usage

```ts
import { openDocument } from '@inkbar/core'
import { assets } from 'virtual:inkbar-assets' // from the Vite plugin, see Loading assets

const doc = await openDocument(file, { assets })
await doc.ready

doc.annotations.add({ type: 'highlight', page: 0, quads })
```

`file` can be a `File`, `Blob`, `ArrayBuffer`, `Uint8Array`, a URL string, `{ url, key }` when the URL is signed and changes between loads, or `{ data, key }` for bytes you want to identify. `quads` is a list of quads in PDF user space. `add` fills in the id, colour, timestamps and bounding box.

In a framework app, `useAnnotations()` gives you the same `add`, `update` and `remove` for the nearest `InkRoot`.

## Saving annotations

Inkbar cannot write annotations into the PDF yet. `save()` rejects with `EngineUnavailable`. Store the JSON in your own backend instead, and import it the next time the document opens:

```ts
const data = doc.exportAnnotations('json')
await saveToYourBackend(doc.key, data)

// On the next open
doc.importAnnotations(await loadFromYourBackend(doc.key), { mode: 'replace' })
```

`doc.key` stays the same between opens only when you open with a key: a URL string, `{ url, key }` or `{ data, key }`. A `File`, `Blob` or raw bytes get a new random key each time, so pass `{ data, key }` with your own document id.

The export is a [Gloss](https://gloss-format.org) document, `{ format: 'gloss', version: 1, documentKey, annotations }`, and holds the annotations made in the session, not the ones embedded in the file. Gloss is an open JSON format for PDF annotations, and its [JSON Schema](https://gloss-format.org/schema/v1.json) lets your backend validate what it stores. The [Gloss format](/docs/reference/gloss/) reference covers what Inkbar adds to Gloss and what it leaves out.

`importAnnotations` takes the object or a JSON string. `replace` drops the current session annotations first. `merge` overwrites by id and keeps the rest. Items with a type this version does not know come back in the result's `unknown` list, and the next export writes them out again.

In a framework app, `useDocument()` returns `exportAnnotations()` and `importAnnotations()` for the open document. In controlled mode your app already holds the list, so you can save that directly.

## Annotations from the PDF

Annotations already in the file are drawn by PDF.js on the page canvas. Inkbar adds them to the list with `source: 'pdf'` and `locked: true`, so people can select and read them, but cannot move, resize or delete them. Exports leave out `source` and `locked`. `doc.embedded`, or `useEmbedded()`, counts them by subtype, including subtypes Inkbar does not model.

## Annotation changes

`doc.annotations.on('change', fn)`, and `onChange(next, change)` in controlled mode, describe each mutation:

- `{ kind: 'add', annotation }`
- `{ kind: 'update', id, before, after }`
- `{ kind: 'remove', annotation, removed }`. Removing a note also removes its replies, so `removed` lists everything that went: `annotation` first, then the replies. A host that syncs by change should delete every id in `removed`.
- `{ kind: 'replace', reason }` for an import, a history step or a controlled sync. Read the whole list.

`add` throws if `input.id` is already in the list. Locked annotations refuse changes to their geometry, `page` and `contents`.

## Undo and redo

Inkbar records history when it holds the annotations, and in controlled mode when you turn `history` on. Put `InkUndo` and `InkRedo` in a toolbar to give people the buttons; each disables itself when there is nothing to undo or redo. Ctrl or Cmd with Z undoes, and Ctrl or Cmd with Shift and Z, or Ctrl with Y, redoes.

To drive history from your own UI, `useHistory()` returns `canUndo`, `canRedo`, `undo`, `redo`, `clear` and `batch` for the nearest `InkRoot`. Without a framework, `doc.history` has `undo`, `redo`, `clear` and `batch`, with `canUndo` and `canRedo` as readables, and `createUndo` and `createRedo` build buttons for a `createViewer` viewer.

`history.batch(fn)` records everything `fn` changes as one undo step, so a host that adds many annotations at once can undo them together. Change events still fire once per annotation. `fn` must be synchronous, and nested calls join the outer batch. The default limit is 200 steps. In controlled mode `doc.history` records nothing, so in a framework app call `batch` from `useHistory()`, which works in both modes.

## Tools and keyboard

`createToolController` from `@inkbar/core/dom` routes pointer and key events on the viewport to the active tool: `select-text`, `select`, `highlight`, `redact-area`, `sketch`, `draw`, `shape`, `freetext`, `signature` or `note`. Highlights, text redactions, notes, shapes, text boxes and signatures can be made from the keyboard. Area redactions, freehand drawing, loupes and masks need a pointer.

| Where focus is               | Key                                           | Effect                                                                                              |
| ---------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Viewport, `highlight` tool   | `Enter`                                       | Turns the text selection into a highlight                                                           |
| Viewport, `redact-area` tool | `Enter`                                       | Turns the text selection into text redactions                                                       |
| Viewport, `note` tool        | `Enter`                                       | Places a note at the centre of the current page and focuses it                                      |
| Viewport, `shape` tool       | `Enter`                                       | Places the current kind at the centre of the current page, except a loupe or mask                   |
| Viewport, `freetext` tool    | `Enter`                                       | Places a text box at the centre of the current page and opens it for typing                         |
| Viewport, `signature` tool   | `Enter`                                       | Places the chosen signature at the centre of the current page                                       |
| Viewport                     | `+` or `=`, `-`                               | Zoom in, zoom out                                                                                   |
| Viewport                     | `Home`, `End`, `PageUp`, `PageDown`           | First, last, previous, next page                                                                    |
| Anywhere in the viewer       | `Ctrl` or `Cmd` + `Z`                         | Undo                                                                                                |
| Anywhere in the viewer       | `Ctrl` or `Cmd` + `Shift` + `Z`, `Ctrl` + `Y` | Redo                                                                                                |
| Annotation                   | `Enter` or `Space`                            | Selects and activates it                                                                            |
| Annotation                   | `ArrowUp`, `ArrowDown`                        | Previous or next annotation on the page, in reading order                                           |
| Annotation                   | `Shift` + arrow                               | Moves it 1 pt (`Shift` + `Alt` + arrow: 10 pt)                                                      |
| Annotation                   | `Ctrl` or `Cmd` + `Shift` + arrow             | Resizes an area redaction, text box or shape by 1 pt. Right and Down grow it, Left and Up shrink it |
| Annotation                   | `Delete` or `Backspace`                       | Removes it                                                                                          |
| Annotation                   | `Escape`                                      | Clears the selection                                                                                |

The framework packages and `createViewer` install all of these. If you build on `createToolController` directly, it and the overlay handle the tool and annotation keys. The zoom and page keys come from `attachViewportKeys`, which the tool controller does not install. Attach it to the same container:

```ts
import { attachViewportKeys } from '@inkbar/core/dom'

const detach = attachViewportKeys(container, {
  viewport,
  pageCount: () => doc.pages.length,
})
// later: detach()
```

On a focused annotation, `Enter` or `Space` selects it and calls `onActivate`. In the framework packages, a note or text markup opens its thread.

Locked annotations, such as those embedded in the file, ignore move, resize and delete. Without a text selection, `Enter` in the `highlight` and `redact-area` tools does nothing.

`redact-area` draws an area mark when you drag. To redact text instead, select the text with the `select-text` tool, switch to `redact-area`, then click inside the selection or press `Enter`. The tool keeps the press from starting a new text selection, so it cannot select text itself.

With either select tool, or on what a `shape` or `freetext` tool just made, a selected area redaction, text box, shape or drawing shows four corner handles (`.ink-handle[data-handle="nw|ne|sw|se"]`), and a line shows one at each end (`data-handle="start|end"`). Dragging a corner resizes it, and `Shift` keeps its aspect ratio; the store records a single update on release. Drag the annotation itself to move it. Drag a box over empty space to select several annotations, and hold `Shift` to add to the selection.
