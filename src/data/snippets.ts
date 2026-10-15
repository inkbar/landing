export type FrameworkId = 'vue' | 'react' | 'svelte'

export interface FrameworkSnippet {
  id: FrameworkId
  label: string
  file: string
  lang: 'vue' | 'tsx' | 'svelte'
  install: string
  /** The complete example, for the Quickstart. */
  code: string
  /** A shorter version for the landing page, with the toolbars in local components. */
  short: string
}

const vue = `<script setup lang="ts">
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
} from '@inkbar/vue'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

defineProps<{ url: string; id: string }>()
</script>

<template>
  <InkRoot :src="{ url, key: id }" :assets="assets">
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
    <InkNotePopover />
    <InkSuggestionCard />
  </InkRoot>
</template>`

const react = `import {
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
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

export function Review({ url, id }: { url: string; id: string }) {
  return (
    <InkRoot src={{ url, key: id }} assets={assets}>
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
      <InkNotePopover />
      <InkSuggestionCard />
    </InkRoot>
  )
}`

const svelte = `<script lang="ts">
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
  } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'
  import '@inkbar/theme/theme.css'

  let { url, id }: { url: string; id: string } = $props()
</script>

<InkRoot src={{ url, key: id }} {assets}>
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
  <InkNotePopover />
  <InkSuggestionCard />
</InkRoot>`

const vueShort = `<script setup lang="ts">
import {
  InkRoot,
  InkViewport,
  InkNotePopover,
  InkSuggestionCard,
} from '@inkbar/vue'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

import Footer from './Footer.vue'
import Toolbar from './Toolbar.vue'

defineProps<{ url: string; id: string }>()
</script>

<template>
  <InkRoot :src="{ url, key: id }" :assets="assets">
    <Toolbar />
    <InkViewport />
    <Footer />
    <InkNotePopover />
    <InkSuggestionCard />
  </InkRoot>
</template>`

const reactShort = `import {
  InkRoot,
  InkViewport,
  InkNotePopover,
  InkSuggestionCard,
} from '@inkbar/react'
import { assets } from 'virtual:inkbar-assets'
import '@inkbar/theme/theme.css'

import { Footer } from './Footer'
import { Toolbar } from './Toolbar'

export function Review({ url, id }: { url: string; id: string }) {
  return (
    <InkRoot src={{ url, key: id }} assets={assets}>
      <Toolbar />
      <InkViewport />
      <Footer />
      <InkNotePopover />
      <InkSuggestionCard />
    </InkRoot>
  )
}`

const svelteShort = `<script lang="ts">
  import {
    InkRoot,
    InkViewport,
    InkNotePopover,
    InkSuggestionCard,
  } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'
  import '@inkbar/theme/theme.css'

  import Footer from './Footer.svelte'
  import Toolbar from './Toolbar.svelte'

  let { url, id }: { url: string; id: string } = $props()
</script>

<InkRoot src={{ url, key: id }} {assets}>
  <Toolbar />
  <InkViewport />
  <Footer />
  <InkNotePopover />
  <InkSuggestionCard />
</InkRoot>`

export const frameworks: readonly FrameworkSnippet[] = [
  {
    id: 'vue',
    label: 'Vue',
    file: 'Review.vue',
    lang: 'vue',
    install: 'pnpm add @inkbar/vue @inkbar/core @inkbar/theme',
    code: vue,
    short: vueShort,
  },
  {
    id: 'react',
    label: 'React',
    file: 'Review.tsx',
    lang: 'tsx',
    install: 'pnpm add @inkbar/react @inkbar/core @inkbar/theme',
    code: react,
    short: reactShort,
  },
  {
    id: 'svelte',
    label: 'Svelte',
    file: 'Review.svelte',
    lang: 'svelte',
    install: 'pnpm add @inkbar/svelte @inkbar/core @inkbar/theme',
    code: svelte,
    short: svelteShort,
  },
]

export const defaultFramework: FrameworkId = 'react'
