# Quickstart

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-74/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-74/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-74/docs/quickstart.md.

Install Inkbar, add the Vite plugin and put a PDF on screen with a toolbar, in Vue, React, Svelte or with no framework.

Put a PDF on screen with tools above it and page and zoom controls below. This page assumes a Vite project.

## 1. Install the packages

You need the core, the theme and the package for your framework. The packages share one version number.

**Vue**

```sh
pnpm add @inkbar/vue @inkbar/core @inkbar/theme
```

**React**

```sh
pnpm add @inkbar/react @inkbar/core @inkbar/theme
```

**Svelte**

```sh
pnpm add @inkbar/svelte @inkbar/core @inkbar/theme
```

## 2. Add the Vite plugin

PDF.js loads a worker, fonts and decoders at runtime. The plugin serves those files in development and copies them into your build. It works with Vite 6 or later.

```ts title="vite.config.ts"
import { inkbar } from '@inkbar/core/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [inkbar()],
})
```

> **Note:** On another bundler, pass your own asset URLs to the root. [Loading
> assets](https://inkbar.dev/pr-preview/pr-74/docs/loading-assets.md) lists the files.

## 3. Mount the viewer

Wrap the viewport in a root. Put a toolbar of tools, undo and redo above it and a page and zoom bar below, then add the popover for notes.

**Vue**, `Review.vue`:

```vue
<script setup lang="ts">
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
import { highlightTool, noteTool, redactAreaTool } from '@inkbar/core/dom'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

defineProps<{ url: string; id: string }>()

const tools = [highlightTool(), redactAreaTool(), noteTool()]
</script>

<template>
  <InkRoot :src="{ url, key: id }" :assets="assets" :tools="tools">
    <InkToolbar>
      <InkToolButton tool="select-text" />
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

**React**, `Review.tsx`:

```tsx
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
import { highlightTool, noteTool, redactAreaTool } from '@inkbar/core/dom'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

const tools = [highlightTool(), redactAreaTool(), noteTool()]

export function Review({ url, id }: { url: string; id: string }) {
  return (
    <InkRoot src={{ url, key: id }} assets={assets} tools={tools}>
      <InkToolbar>
        <InkToolButton tool="select-text" />
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

**Svelte**, `Review.svelte`:

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
  import { highlightTool, noteTool, redactAreaTool } from '@inkbar/core/dom'
  import { assets } from 'virtual:inkbar-assets'
  import '@inkbar/theme/theme.css'

  let { url, id }: { url: string; id: string } = $props()

  const tools = [highlightTool(), redactAreaTool(), noteTool()]
</script>

<InkRoot src={{ url, key: id }} {assets} {tools}>
  <InkToolbar>
    <InkToolButton tool="select-text" />
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

`select-text` and `select` are always there. Every other tool is opt-in: pass the ones your toolbar offers as `tools`, from the factories in `@inkbar/core/dom`, so only those end up in your bundle. `allTools()` returns all eight. A button for a tool you did not pass renders disabled and hidden, and logs an `InkError('UnknownTool')` to the console.

The viewer fills its parent, so give the parent a height. Without one, the document has no room to scroll. Each control is its own component: drop the ones you don't need, move them, or add your own buttons. [Toolbars](https://inkbar.dev/pr-preview/pr-74/docs/guides/toolbars.md) covers them.

Inkbar keeps the annotations itself here, with undo and redo. To hold them in your own state, read [Controlled mode](https://inkbar.dev/pr-preview/pr-74/docs/guides/controlled-mode.md). Annotations live in memory until you save them. [Saving](https://inkbar.dev/pr-preview/pr-74/docs/guides/saving.md) writes them into the PDF, and [Annotations](https://inkbar.dev/pr-preview/pr-74/docs/guides/annotations.md#saving-annotations) shows how to store them as JSON.

## Next

- [Restyle the controls](https://inkbar.dev/pr-preview/pr-74/docs/guides/theming.md) with your own tokens and CSS.
- [Work with annotations](https://inkbar.dev/pr-preview/pr-74/docs/guides/annotations.md) and save them as JSON.
- [Mark and apply redactions](https://inkbar.dev/pr-preview/pr-74/docs/guides/redaction.md).
- Read the page for your framework: [Vue](https://inkbar.dev/pr-preview/pr-74/docs/frameworks/vue.md), [React](https://inkbar.dev/pr-preview/pr-74/docs/frameworks/react.md), [Svelte](https://inkbar.dev/pr-preview/pr-74/docs/frameworks/svelte.md) or [Plain DOM](https://inkbar.dev/pr-preview/pr-74/docs/frameworks/plain-dom.md).
- Compare with the [sandbox](https://sandbox.inkbar.dev), which runs the same setup in each framework.
