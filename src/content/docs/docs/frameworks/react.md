---
title: React
description: Use Inkbar in a React 19 app with components and hooks.
---

React components and hooks for Inkbar. The components are unstyled primitives built on `@inkbar/core`.

Install the packages as the [Quickstart](/docs/quickstart/) shows.

React 19 is a peer dependency. Add the Vite plugin from `@inkbar/core/vite` so the PDF engine can load its worker and fonts; [Loading assets](/docs/loading-assets/) covers it. The package is marked `'use client'`, so a React Server Components app can import it from a server component.

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
  InkNotePopover,
  InkSuggestionCard,
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
      <InkNotePopover />
      <InkSuggestionCard />
    </InkRoot>
  )
}
```

Each control is a separate component, so put them in any order or leave some out. Buttons show icons from `@inkbar/icons`. Pass your own as `children` to replace one, and use `InkIcon` to put the same icons on your own buttons. [Toolbars](/docs/guides/toolbars/) lists every control.

`annotations` with `onAnnotationsChange` makes your list the source of truth. Leave them off and Inkbar keeps the state itself, with undo and redo.

## Note popover

`InkNotePopover` opens the thread of the activated note. A new note has no text yet, so the form first writes the note's own text (labelled "Comment"); after that it adds replies.

A root note with no text and no replies is removed when its popover closes, or when activation moves to another annotation, so abandoned notes do not stay on the page. Locked notes are never removed. If you add notes yourself (`add({ type: 'note', ... })`), give them `contents`, or they will be removed the first time someone opens and closes them.

## Custom rendering

Slots are render props. `InkViewport` takes `loading`, `empty`, `error`, `renderAnnotation` and `renderPageError`; `InkNotePopover` and `InkSuggestionCard` take a function as `children`; `InkToolButton` takes a node or a function of `{ active, label }`. The props each receives are typed as `AnnotationSlotProps`, `NotePopoverSlotProps` and `SuggestionCardSlotProps`, the same types the Vue package exports.

## Keyboard

The scroll element takes focus. With the highlight or redact tool active, `Enter` turns the text selection into a mark; with the note tool, `Enter` places a note in the middle of the current page and opens it. On a focused annotation, `Enter` or `Space` selects and activates it (a note opens its thread and a suggested redaction its card; other types are only selected), `ArrowUp` and `ArrowDown` move between annotations, `Shift` + arrow moves it by 1 pt (add `Alt` for 10 pt), `Ctrl` or `Cmd` + `Shift` + arrow resizes an area mark, and `Delete` removes it. The full table is in [Annotations](/docs/guides/annotations/#tools-and-keyboard).

## Styling

Components carry state on data attributes, for example `[data-annotation][data-state="selected"]` and `[data-tool="highlight"][data-state="on"]`. `@inkbar/theme` gives a default look. Your own CSS overrides it without `!important`. `InkRoot`, `InkViewport`, `InkToolbar` and the toolbar controls accept `className`.

## Hooks

`useDocument`, `useAnnotations`, `useTool`, `useSelection`, `useZoom`, `usePage`, `useHistory` and `useEmbedded` read the state of the nearest `InkRoot`. Build your own controls or side panel from them.
