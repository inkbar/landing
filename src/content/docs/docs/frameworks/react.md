---
title: React
description: Use Inkbar in a React 19 app with components and hooks.
---

React components and hooks for Inkbar. The components are unstyled primitives built on `@inkbar/core`.

Install the packages as the [Quickstart](/docs/quickstart/) shows.

React 19 and React DOM 19 are peer dependencies. Add the Vite plugin from `@inkbar/core/vite` so PDF.js can load its worker and fonts; [Loading assets](/docs/loading-assets/) covers it. The package is marked `'use client'`, so a React Server Components app can import it from a server component.

## Usage

```tsx
import { useState } from 'react'
import {
  InkRoot,
  InkViewport,
  InkToolbar,
  InkToolButton,
  InkToolbarSeparator,
  InkUndo,
  InkRedo,
  InkPrevPage,
  InkPageInput,
  InkPageCount,
  InkNextPage,
  InkZoomSelect,
  InkThreadPopover,
} from '@inkbar/react'
import type { Annotation } from '@inkbar/core'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

export function Review({
  signedUrl,
  documentId,
}: {
  signedUrl: string
  documentId: string
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  return (
    <InkRoot
      src={{ url: signedUrl, key: documentId }}
      assets={assets}
      annotations={annotations}
      onAnnotationsChange={setAnnotations}
    >
      <InkToolbar>
        <InkToolButton tool="view" />
        <InkToolButton tool="select" />
        <InkToolButton tool="highlight" />
        <InkToolButton tool="redact-area" />
        <InkToolButton tool="note" />
        <InkToolbarSeparator />
        <InkUndo />
        <InkRedo />
      </InkToolbar>
      <InkViewport />
      <InkToolbar label="Page and zoom">
        <InkPrevPage />
        <InkPageInput />
        <InkPageCount />
        <InkNextPage />
        <InkZoomSelect />
      </InkToolbar>
      <InkThreadPopover />
    </InkRoot>
  )
}
```

Each control is a separate component, so put them in any order or leave some out. Buttons show icons from `@inkbar/icons`. Pass your own as `children` to replace one, and use `InkIcon` to put the same icons on your own buttons. [Toolbars](/docs/guides/toolbars/) lists every control.

`annotations` with `onAnnotationsChange` makes your list the source of truth. Leave them off and Inkbar keeps the state itself, with undo and redo.

## Thread popover

`InkThreadPopover` opens the thread of the activated note or text markup. A new note or highlight has no text yet, so the form first writes its own text (labelled "Comment"); after that it adds replies.

A root note with no text and no replies is removed when its popover closes, or when activation moves to another annotation, so abandoned notes do not stay on the page. Locked notes are never removed. If you add notes yourself (`add({ type: 'note', ... })`), give them `contents`, or they will be removed the first time someone opens and closes them.

## Custom rendering

Slots are render props. `InkViewport` takes `loading`, `empty`, `error`, `renderAnnotation` and `renderPageError`; `InkThreadPopover` takes a function as `children`; `InkToolButton` takes a node or a function of `{ active, label }`. The props each receives are typed as `AnnotationSlotProps` and `ThreadPopoverSlotProps`, the same types the Vue and Svelte packages export.

`InkRoot` takes `decorateAnnotation`, which returns your own `data`, `classes` and `description` for an annotation's element, as `mountViewer` describes in [Your own chrome](/docs/frameworks/plain-dom/#your-own-chrome). Pass a new function when its output depends on your own state, and Inkbar applies it on the next render.

```tsx
import type { DecorateAnnotation } from '@inkbar/react'

const decorate: DecorateAnnotation = (a) =>
  a.custom?.review === 'open' ? { data: { review: 'open' }, description: 'Needs review' } : undefined

<InkRoot src={file} assets={assets} decorateAnnotation={decorate}>
  <InkViewport />
</InkRoot>
```

For your own card next to an annotation, read `activated`, `setActivated` and `rootEl` from `useInkContext` and pass them to `createPopover`, as [Your own popovers](/docs/frameworks/plain-dom/#your-own-popovers) shows. The context's `setActivated` calls `onActivate` for an id.

`InkRoot`, `InkToolbar`, `InkToolButton`, `InkUndo`, `InkRedo`, `InkPrevPage`, `InkNextPage`, `InkZoomIn` and `InkZoomOut` take `asChild` to render your own element in place of theirs, such as a button from your design system. Pass that element as the only child. The control keeps its behaviour and accessible name.

## Keyboard

The scroll area takes focus. From there:

- With the `highlight` or `redact-area` tool active, `Enter` turns the text selection into a mark.
- With the `note` tool active, `Enter` places a note at the centre of the current page and opens it.

On a focused annotation:

- `Enter` or `Space` selects and activates it. A note or text markup opens its thread; other types are only selected.
- `ArrowUp` and `ArrowDown` move to the previous or next annotation on the page.
- `Shift` + arrow moves it by 1 pt, or by 10 pt with `Alt` as well.
- `Ctrl` or `Cmd` + `Shift` + arrow resizes an area redaction, text box or shape.
- `Delete` or `Backspace` removes it.

The full table, with the zoom and page keys, is in [Annotations](/docs/guides/annotations/#tools-and-keyboard).

## Styling

Components carry state on data attributes, for example `[data-annotation][data-state="selected"]` and `[data-tool="highlight"][data-state="on"]`. `@inkbar/theme` gives a default look. Your own CSS overrides it without `!important`. `InkRoot`, `InkViewport`, `InkToolbar` and the toolbar controls accept `className`.

## Hooks

`useDocument`, `useAnnotations`, `useTool`, `useSelection`, `useZoom`, `usePage`, `useHistory` and `useEmbedded` read the state of the nearest `InkRoot`. Build your own controls or side panel from them.
