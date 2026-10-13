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
  DefaultToolbar,
  InkNotePopover,
  InkSuggestionCard,
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
    <DefaultToolbar />
    <InkViewport />
    <InkNotePopover />
    <InkSuggestionCard />
  </InkRoot>
</template>
```

`v-model:annotations` makes your list the source of truth. Leave it off and Inkbar keeps the state itself, with undo and redo.

## Note popover

`InkNotePopover` opens the thread of the activated note. A new note has no text yet, so the form first writes the note's own text (labelled "Comment"); after that it adds replies.

A root note with no text and no replies is removed when its popover closes, or when activation moves to another annotation, so abandoned notes do not stay on the page. Locked notes are never removed. If you add notes yourself (`add({ type: 'note', ... })`), give them `contents`, or they will be removed the first time someone opens and closes them.

## Keyboard

The scroll element takes focus. With the highlight or redact tool active, `Enter` turns the text selection into a mark; with the note tool, `Enter` places a note in the middle of the current page and opens it. On a focused annotation, `Enter` or `Space` selects and activates it (a note opens its thread and a suggested redaction its card; other types are only selected), `ArrowUp` and `ArrowDown` move between annotations, `Shift` + arrow moves it by 1 pt (add `Alt` for 10 pt), `Ctrl` or `Cmd` + `Shift` + arrow resizes an area mark, and `Delete` removes it. The full table is in [Annotations](/docs/guides/annotations/#tools-and-keyboard).

## Styling

Components carry state on data attributes, for example `[data-annotation][data-state="selected"]` and `[data-tool="highlight"][data-state="on"]`. `@inkbar/theme` gives a default look. Your own CSS overrides it without `!important`.

## Composables

`useDocument`, `useAnnotations`, `useTool`, `useSelection`, `useZoom`, `usePage`, `useHistory` and `useEmbedded` read the state of the nearest `InkRoot`. Build your own toolbar or side panel from them.
