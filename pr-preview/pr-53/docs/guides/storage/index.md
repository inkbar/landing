# Storage

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-53/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-53/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-53/docs/quickstart.md.

Choose where Inkbar keeps saved signatures, sidebar widths and plugin settings between visits, from memory to localStorage to your own server.

Inkbar keeps a few small things between visits: saved signatures, sidebar widths and plugin settings. Your app decides where they go. Inkbar never touches `localStorage`, cookies or the network unless the store you pass does.

## Passing a store

Pass `storage` to the root. Without it, everything lasts until the page reloads.

**Vue**

```vue
<script setup lang="ts">
import { createLocalStorage } from '@inkbar/core'
import { InkRoot, InkViewport } from '@inkbar/vue'
import { assets } from 'virtual:inkbar-assets'

defineProps<{ file: File }>()

const storage = createLocalStorage('my-app')
</script>

<template>
  <InkRoot :src="file" :assets="assets" :storage="storage">
    <InkViewport />
  </InkRoot>
</template>
```

**React**

```tsx
import { createLocalStorage } from '@inkbar/core'
import { InkRoot, InkViewport } from '@inkbar/react'
import { assets } from 'virtual:inkbar-assets'

const storage = createLocalStorage('my-app')

export function Viewer({ file }: { file: File }) {
  return (
    <InkRoot src={file} assets={assets} storage={storage}>
      <InkViewport />
    </InkRoot>
  )
}
```

**Svelte**

```svelte
<script lang="ts">
  import { createLocalStorage } from '@inkbar/core'
  import { InkRoot, InkViewport } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'

  let { file }: { file: File } = $props()

  const storage = createLocalStorage('my-app')
</script>

<InkRoot src={file} {assets} {storage}>
  <InkViewport />
</InkRoot>
```

**Plain DOM**

```ts
import { createLocalStorage } from '@inkbar/core'
import { createViewer } from '@inkbar/core/dom'
import { assets } from 'virtual:inkbar-assets'

const viewer = createViewer(el, {
  source: file,
  assets,
  storage: createLocalStorage('my-app'),
})
```

The root reads `storage` once, when it is created. Signatures, sidebars inside the root and plugins all use it.

## The stores Inkbar ships

`@inkbar/core` has two:

- `createMemoryStorage(initial?)` is the default. It forgets everything on reload. Pass `initial`, an object of keys and values, to start it with something in it.
- `createLocalStorage(prefix = 'inkbar')` writes JSON to `localStorage` under `<prefix>:<key>`. It reads `localStorage` on every call, so a change made in another tab shows. Where the browser blocks storage, as some private windows do, or there's no `localStorage` at all, as during server rendering, it keeps values in memory for the page's life. When storage is full, `set` rejects with an `Error` whose `cause` is the browser's, and the old value stays.

Give each app its own prefix, so two apps on one origin keep their values apart. Key it by user too when people share a browser, since a saved signature belongs to one person.

## Writing your own

A store has three methods. Each may answer straight away or return a promise, and every value is JSON:

```ts
interface InkStorage {
  get(key: string): unknown | Promise<unknown> // undefined when there is nothing
  set(key: string, value: unknown): void | Promise<void>
  remove(key: string): void | Promise<void>
}
```

This one keeps everything on your server:

```ts
import type { InkStorage } from '@inkbar/core'

const prefs = (key: string) => `/api/prefs/${encodeURIComponent(key)}`

export const storage: InkStorage = {
  get: async (key) => {
    const res = await fetch(prefs(key))
    return res.ok ? res.json() : undefined
  },
  set: async (key, value) => {
    const res = await fetch(prefs(key), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(value),
    })
    if (!res.ok) throw new Error(`Saving ${key} failed: ${res.status}`)
  },
  remove: async (key) => {
    await fetch(prefs(key), { method: 'DELETE' })
  },
}
```

Reject from `set` when a save fails. The signature dialog then tells the person their signature was not saved.

The same three methods fit a Redux or Pinia store, IndexedDB or anything else your app already keeps state in.

### Answering straight away

A store that answers straight away, as the memory and `localStorage` stores do, lets a sidebar take its saved width before it first paints. A store that returns promises works too, but the sidebar shows its default width first and moves to the saved one when it arrives. To avoid that jump with a server store, load the values with the page and answer `get` from them.

## The keys Inkbar uses

| Key                    | Value                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `signatures`           | An array of [signature templates](https://inkbar.dev/pr-preview/pr-53/docs/guides/signatures.md#where-signatures-are-kept) |
| `sidebar.<name>.width` | A [sidebar's width](https://inkbar.dev/pr-preview/pr-53/docs/guides/sidebars.md#width), a number in CSS pixels             |
| `plugin.<id>.<key>`    | Whatever a plugin keeps                                                               |

`scopeStorage(storage, prefix)` from `@inkbar/core` wraps a store so every key gains `<prefix>.`, which is how each plugin gets its own.

## In a plugin

A plugin gets `ctx.storage`, the root's store scoped to `plugin.<id>`. A plugin with the id `review` that sets `panel` writes `plugin.review.panel`, and it can't read or overwrite Inkbar's keys or another plugin's.

```ts
import { definePlugin } from '@inkbar/core/dom'

export const review = definePlugin({
  id: 'review',
  setup(ctx) {
    let showResolved = false
    void Promise.resolve(ctx.storage.get('showResolved')).then((saved) => {
      showResolved = saved === true
    })
    // Later, when the person changes the setting:
    // void ctx.storage.set('showResolved', true)
  },
})
```

`get` and `set` may return a promise, depending on the store, so wrap a read in `Promise.resolve` when you need the value.

Use `ctx.storage` for settings that outlast a document and a visit, such as a filter or a panel width. Use [`ctx.store(name)`](https://inkbar.dev/pr-preview/pr-53/docs/guides/writing-a-plugin.md#record-stores) for records that belong to one document and undo with its edits.

Every plugin shares the page with your app, so scoping keeps plugins from clashing by accident. It doesn't keep a plugin out on purpose.
