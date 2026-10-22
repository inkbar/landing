---
title: Vue
description: Use Inkbar in a Vue 3 app with components and composables.
---

Vue 3 components and composables for Inkbar. The components are unstyled primitives built on `@inkbar/core`.

Install the packages as the [Quickstart](/docs/quickstart/) shows.

Vue 3.5 or later is a peer dependency. Add the Vite plugin from `@inkbar/core/vite` so PDF.js can load its worker and fonts; [Loading assets](/docs/loading-assets/) covers it.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
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
} from '@inkbar/vue'
import type { Annotation } from '@inkbar/core'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

defineProps<{ signedUrl: string; documentId: string }>()

const annotations = ref<Annotation[]>([])
</script>

<template>
  <InkRoot
    :src="{ url: signedUrl, key: documentId }"
    :assets="assets"
    v-model:annotations="annotations"
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
</template>
```

Each control is a separate component, so put them in any order or leave some out. Buttons show icons from `@inkbar/icons`. Put your own in a button's default slot to replace one, and use `InkIcon` to put the same icons on your own buttons. [Toolbars](/docs/guides/toolbars/) lists every control.

`v-model:annotations` makes your list the source of truth. Leave it off and Inkbar keeps the state itself, with undo and redo.

## Thread popover

`InkThreadPopover` opens the thread of the activated note or text markup. A new note or highlight has no text yet, so the form first writes its own text (labelled "Comment"); after that it adds replies.

A root note with no text and no replies is removed when its popover closes, or when activation moves to another annotation, so abandoned notes do not stay on the page. Locked notes are never removed. If you add notes yourself (`add({ type: 'note', ... })`), give them `contents`, or they will be removed the first time someone opens and closes them.

## Custom rendering

Slots let you render parts yourself. `InkViewport` has `loading`, `empty`, `error`, `annotation` and `page-error` slots. `InkThreadPopover` has a scoped default slot that receives the popover's props, the default slot of `InkToolButton` receives `{ active, label }`, and that of `InkCommand` receives `{ label, busy }`. The props are typed as `AnnotationSlotProps` and `ThreadPopoverSlotProps`, the same types the React and Svelte packages export.

`InkRoot` takes `decorate-annotation`, a function that returns your own `data`, `classes` and `description` for an annotation's element, as `mountViewer` describes in [Your own chrome](/docs/frameworks/plain-dom/#your-own-chrome). Pass a new function when its output depends on your own state, and Inkbar applies it again.

```vue
<script setup lang="ts">
import type { DecorateAnnotation } from '@inkbar/vue'

const decorate: DecorateAnnotation = (a) =>
  a.custom?.review === 'open'
    ? { data: { review: 'open' }, description: 'Needs review' }
    : undefined
</script>

<template>
  <InkRoot :src="file" :assets="assets" :decorate-annotation="decorate">
    <InkViewport />
  </InkRoot>
</template>
```

For your own card next to an annotation, read the `activated` and `rootEl` refs and `setActivated` from `injectInkContext()` and use them with `createFocusReturn` and `createPopover`, as [Your own popovers](/docs/frameworks/plain-dom/#your-own-popovers) shows. The context's `setActivated` emits `activate` for an id; `viewer.setActivated` in plain DOM does not.

`InkRoot`, `InkToolbar`, `InkToolButton`, `InkCommand`, `InkUndo`, `InkRedo`, `InkPrevPage`, `InkNextPage`, `InkZoomIn` and `InkZoomOut` take `as-child` to render your own element in place of theirs, such as a button from your design system. Put that element in the default slot. The control keeps its behaviour and accessible name.

## Plugins

Pass plugins to `InkRoot` as `:plugins`. The list is read once, when the root mounts. Nothing a plugin adds shows until you place it: a command with `InkCommand id="<plugin>.<id>"`, a tool with `InkToolButton tool="<plugin>.<id>"`. For a control of your own, `useCommand(id)` returns the command's `run`, `enabled`, `busy`, `status`, `label` and `icon`. [Plugins](/docs/guides/plugins/) covers placing commands, saving plugin records and undo, and [Writing a plugin](/docs/guides/writing-a-plugin/) covers building one.

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

Components carry state on data attributes, for example `[data-annotation][data-state="selected"]` and `[data-tool="highlight"][data-state="on"]`. `@inkbar/theme` gives a default look. Your own CSS overrides it without `!important`.

## Composables

`useDocument`, `useAnnotations`, `useTool`, `useSelection`, `useZoom`, `usePage`, `useHistory`, `useEmbedded` and `useCommand` read the state of the nearest `InkRoot`. Build your own controls or side panel from them.
