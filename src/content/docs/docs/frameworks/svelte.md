---
title: Svelte
description: Use Inkbar in a Svelte 5 app with components and hooks.
---

Svelte 5 components and hooks for Inkbar. The components are unstyled primitives built on `@inkbar/core`.

Install the packages as the [Quickstart](/docs/quickstart/) shows.

Svelte 5.46.4 or later is a peer dependency. Add the Vite plugin from `@inkbar/core/vite` so PDF.js can load its worker and fonts; [Loading assets](/docs/loading-assets/) covers it. The package ships `.svelte` sources, so your bundler compiles them for your target, including the server.

## Usage

```svelte
<script lang="ts">
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
  } from '@inkbar/svelte'
  import type { Annotation } from '@inkbar/core'
  import { assets } from 'virtual:inkbar-assets'
  import '@inkbar/theme/theme.css'

  let { signedUrl, documentId }: { signedUrl: string; documentId: string } = $props()

  let annotations = $state.raw<Annotation[]>([])
</script>

<InkRoot src={{ url: signedUrl, key: documentId }} {assets} bind:annotations>
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
```

Each control is a separate component, so put them in any order or leave some out. Buttons show icons from `@inkbar/icons`. Pass your own as `children` to replace one, and use `InkIcon` to put the same icons on your own buttons. [Toolbars](/docs/guides/toolbars/) lists every control.

`bind:annotations` makes your list the source of truth. Declare it with `$state.raw`, since Inkbar replaces the list whole. Leave the binding off and Inkbar keeps the state itself, with undo and redo. [Controlled mode](/docs/guides/controlled-mode/) covers the details.

`tool`, `page` and `zoom` are bindable too, and each has a callback prop such as `onToolChange` if you would rather not bind.

## Thread popover

`InkThreadPopover` opens the thread of the activated note or text markup. A new note or highlight has no text yet, so the form first writes its own text (labelled "Comment"); after that it adds replies.

A root note with no text and no replies is removed when its popover closes, or when activation moves to another annotation, so abandoned notes do not stay on the page. Locked notes are never removed. If you add notes yourself (`add({ type: 'note', ... })`), give them `contents`, or they will be removed the first time someone opens and closes them.

## Custom rendering

Slots are snippets. `InkViewport` takes `loading`, `empty`, `error`, `annotation` and `pageError`. `InkThreadPopover` takes `children` as a snippet that receives the popover's props. `InkToolButton` takes `children` as a snippet of `{ active, label }`, and `InkCommand` one of `{ label, busy }`. The props each receives are typed as `AnnotationSlotProps` and `ThreadPopoverSlotProps`, the same types the Vue and React packages export.

`InkRoot` takes `decorateAnnotation`, which returns your own `data`, `classes` and `description` for an annotation's element, as `mountViewer` describes in [Your own chrome](/docs/frameworks/plain-dom/#your-own-chrome). Pass a new function when its output depends on your own state, and Inkbar applies it again.

```svelte
<script lang="ts">
  import type { DecorateAnnotation } from '@inkbar/svelte'

  const decorate: DecorateAnnotation = (a) =>
    a.custom?.review === 'open'
      ? { data: { review: 'open' }, description: 'Needs review' }
      : undefined
</script>

<InkRoot src={file} {assets} decorateAnnotation={decorate}>
  <InkViewport />
</InkRoot>
```

For your own card next to an annotation, read `activated`, `setActivated` and `rootEl` from `useInkContext` and use them with `createFocusReturn` and `createPopover`, as [Your own popovers](/docs/frameworks/plain-dom/#your-own-popovers) shows. The context's `setActivated` calls `onActivate` for an id; `viewer.setActivated` in plain DOM does not.

`InkRoot`, `InkToolbar`, `InkToolButton`, `InkCommand`, `InkUndo`, `InkRedo`, `InkPrevPage`, `InkNextPage`, `InkZoomIn` and `InkZoomOut` take a `child` snippet to render your own element. Spread the `props` it gives you on that element. The snippet type is exported as `ChildSnippet`.

```svelte
<InkToolbar>
  {#snippet child({ props })}
    <nav {...props} class="my-toolbar">…</nav>
  {/snippet}
</InkToolbar>
```

## Plugins

Pass plugins to `InkRoot` as `plugins`. The list is read once, when the root mounts. Nothing a plugin adds shows until you place it: a command with `InkCommand id="<plugin>.<id>"`, a tool with `InkToolButton tool="<plugin>.<id>"`. For a control of your own, `useCommand(id)` returns the command's `run`, `enabled`, `busy`, `status`, `label` and `icon`. [Plugins](/docs/guides/plugins/) covers placing commands, saving plugin records and undo, and [Writing a plugin](/docs/guides/writing-a-plugin/) covers building one.

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

Components carry state on data attributes, for example `[data-annotation][data-state="selected"]` and `[data-tool="highlight"][data-state="on"]`. `@inkbar/theme` gives a default look. Your own CSS overrides it without `!important`. `InkRoot`, `InkViewport`, `InkToolbar` and the toolbar controls accept `class`.

## Hooks

`useDocument`, `useAnnotations`, `useTool`, `useSelection`, `useZoom`, `usePage`, `useHistory`, `useEmbedded`, `useCommand` and `useSearch` read the state of the nearest `InkRoot`. Call them during component initialisation, as you would `getContext`. Build your own controls or side panel from them.

Each hook returns an object whose reactive members are getters. Read `useZoom().zoom` in your template or an effect and it tracks. Destructure it (`const { zoom } = useZoom()`) and you copy the value once, so keep the object and read through it.
