export type FrameworkId = 'vue' | 'react' | 'svelte'

export interface FrameworkSnippet {
  id: FrameworkId
  label: string
  file: string
  lang: 'vue' | 'tsx' | 'svelte'
  install: string
  code: string
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

export const frameworks: readonly FrameworkSnippet[] = [
  {
    id: 'vue',
    label: 'Vue',
    file: 'Review.vue',
    lang: 'vue',
    install: 'pnpm add @inkbar/vue @inkbar/core @inkbar/theme',
    code: vue,
  },
  {
    id: 'react',
    label: 'React',
    file: 'Review.tsx',
    lang: 'tsx',
    install: 'pnpm add @inkbar/react @inkbar/core @inkbar/theme',
    code: react,
  },
  {
    id: 'svelte',
    label: 'Svelte',
    file: 'Review.svelte',
    lang: 'svelte',
    install: 'pnpm add @inkbar/svelte @inkbar/core @inkbar/theme',
    code: svelte,
  },
]

export const defaultFramework: FrameworkId = 'react'
