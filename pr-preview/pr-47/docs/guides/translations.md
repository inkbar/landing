# Translations

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-47/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-47/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-47/docs/quickstart.md.

Show Inkbar in your own language with the French and German sets, override single strings, switch language live, and translate the labels you supply.

Every string Inkbar shows comes from `messages`. English is the default. French and German ship with the library, and any other language is a set of strings you pass in.

## Why strings

`messages` is a plain object of strings and small functions. Inkbar asks nothing of your translation setup, so it works with whatever your app uses, or with nothing. The examples here call a generic `t(key, params)` where your own function goes.

A set is nested by feature area, such as `toolbar` and `find`. `messages` takes a partial set, and a key you leave out stays English.

## Override a few keys

Pass only what you want to change.

**Vue**

```vue
<script setup lang="ts">
import { InkRoot, InkViewport } from '@inkbar/vue'
import { assets } from 'virtual:inkbar-assets'

defineProps<{ file: File }>()

const messages = { toolbar: { find: 'Search this file' } }
</script>

<template>
  <InkRoot :src="file" :assets="assets" :messages="messages">
    <InkViewport />
  </InkRoot>
</template>
```

**React**

```tsx
import { InkRoot, InkViewport } from '@inkbar/react'
import { assets } from 'virtual:inkbar-assets'

const messages = { toolbar: { find: 'Search this file' } }

export function Viewer({ file }: { file: File }) {
  return (
    <InkRoot src={file} assets={assets} messages={messages}>
      <InkViewport />
    </InkRoot>
  )
}
```

**Svelte**

```svelte
<script lang="ts">
  import { InkRoot, InkViewport } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'

  let { file }: { file: File } = $props()

  const messages = { toolbar: { find: 'Search this file' } }
</script>

<InkRoot src={file} {assets} {messages}>
  <InkViewport />
</InkRoot>
```

**Plain DOM**

```ts
import { createViewer } from '@inkbar/core/dom'
import { assets } from 'virtual:inkbar-assets'

const viewer = createViewer(el, {
  source: file,
  assets,
  messages: { toolbar: { find: 'Search this file' } },
})
```

Passing `messages` again replaces the last value, so overrides do not pile up.

## French and German

Each language is its own entry point, so your bundler drops the ones you don't import.

**Vue**

```vue
<script setup lang="ts">
import { fr } from '@inkbar/core/locales/fr'
import { InkRoot, InkViewport } from '@inkbar/vue'
import { assets } from 'virtual:inkbar-assets'

defineProps<{ file: File }>()
</script>

<template>
  <InkRoot :src="file" :assets="assets" :messages="fr">
    <InkViewport />
  </InkRoot>
</template>
```

**React**

```tsx
import { fr } from '@inkbar/core/locales/fr'
import { InkRoot, InkViewport } from '@inkbar/react'
import { assets } from 'virtual:inkbar-assets'

export function Viewer({ file }: { file: File }) {
  return (
    <InkRoot src={file} assets={assets} messages={fr}>
      <InkViewport />
    </InkRoot>
  )
}
```

**Svelte**

```svelte
<script lang="ts">
  import { fr } from '@inkbar/core/locales/fr'
  import { InkRoot, InkViewport } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'

  let { file }: { file: File } = $props()
</script>

<InkRoot src={file} {assets} messages={fr}>
  <InkViewport />
</InkRoot>
```

**Plain DOM**

```ts
import { createViewer } from '@inkbar/core/dom'
import { fr } from '@inkbar/core/locales/fr'
import { assets } from 'virtual:inkbar-assets'

const viewer = createViewer(el, { source: file, assets, messages: fr })
```

`de` comes from `@inkbar/core/locales/de`. To change a string in a shipped set, spread it: `messages: { ...fr, find: { ...fr.find, field: 'Chercher' } }`.

Both sets are drafts. If a string reads wrong to you, [open an issue on inkbar/inkbar](https://github.com/inkbar/inkbar/issues) with the key and the wording you would use.

## Messages with values

A message that takes values is a function of one params object. Call your own `t` from it:

```ts
import type { InkMessagesInput } from '@inkbar/core'

declare function t(key: string, params?: object): string

const messages: InkMessagesInput = {
  lang: 'es',
  find: {
    field: t('find.field'),
    count: ({ current, total }) => t('find.count', { current, total }),
  },
}
```

Plurals are your `t`'s job. It knows your language's rules, so `find.count` returns "1 de 1" or "2 de 7" in the form your language needs.

To do the same by hand, use the two helpers from `@inkbar/core`. `template` fills `{name}` placeholders. `plural` picks a form by the language's plural rule for one parameter, and `other` is the fallback:

```ts
import { plural, template } from '@inkbar/core'

const messages = {
  lang: 'en',
  search: {
    resultCount: plural('en', 'count', {
      one: '{count} result',
      other: '{count} results',
    }),
  },
  thumbnails: {
    page: template('en', 'Page {page}'),
  },
}
```

Both format numbers for the language you give them, so 1200 reads `1,200` in English and `1.200` in German. The shipped sets are built with them.

## Switching live

Change `messages` or `locale` and the viewer relabels in place. It does not remount, reload the document or move the scroll position, and an open menu, popover, dialog or find bar stays open.

**Vue**

```vue
<script setup lang="ts">
import { de } from '@inkbar/core/locales/de'
import { fr } from '@inkbar/core/locales/fr'
import { InkRoot, InkViewport } from '@inkbar/vue'
import { ref } from 'vue'
import { assets } from 'virtual:inkbar-assets'

defineProps<{ file: File }>()

const messages = ref(fr)
</script>

<template>
  <button @click="messages = fr">Français</button>
  <button @click="messages = de">Deutsch</button>
  <InkRoot :src="file" :assets="assets" :messages="messages">
    <InkViewport />
  </InkRoot>
</template>
```

**React**

```tsx
import { de } from '@inkbar/core/locales/de'
import { fr } from '@inkbar/core/locales/fr'
import { InkRoot, InkViewport } from '@inkbar/react'
import { useState } from 'react'
import { assets } from 'virtual:inkbar-assets'

export function Viewer({ file }: { file: File }) {
  const [messages, setMessages] = useState(fr)
  return (
    <>
      <button onClick={() => setMessages(fr)}>Français</button>
      <button onClick={() => setMessages(de)}>Deutsch</button>
      <InkRoot src={file} assets={assets} messages={messages}>
        <InkViewport />
      </InkRoot>
    </>
  )
}
```

**Svelte**

```svelte
<script lang="ts">
  import { de } from '@inkbar/core/locales/de'
  import { fr } from '@inkbar/core/locales/fr'
  import { InkRoot, InkViewport } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'

  let { file }: { file: File } = $props()

  let messages = $state(fr)
</script>

<button onclick={() => (messages = fr)}>Français</button>
<button onclick={() => (messages = de)}>Deutsch</button>
<InkRoot src={file} {assets} {messages}>
  <InkViewport />
</InkRoot>
```

**Plain DOM**

```ts
import { de } from '@inkbar/core/locales/de'

viewer.setMessages(de)
viewer.setLocale('de-CH') // optional
```

`viewer.messages` is a readable of the words and locale in use, as `{ messages, locale }`. `subscribe` calls you after each `setMessages` or `setLocale`. Pieces made without a viewer, such as `createToolbar`, follow it when you pass `messages: viewer.messages`.

## Locale and lang

Each set carries its `lang`: `fr.lang` is `'fr'`. Without a `locale`, the viewer root's `lang` attribute and the dates on notes follow it, so `messages={fr}` alone reads as French to a screen reader. Pass `locale`, such as `'de-CH'`, when the page language or the date format should differ from the messages.

## Labels you supply

The text you pass in is yours to translate. These each take a string or a function that returns one:

- a tool's `label`, and the `label` of a toolbar or panel
- a sidebar's `handleLabel`
- an outline's `emptyText`
- a plugin command's label and its `errorStatus`
- a card's `title`, `label` and action labels

Inkbar calls a function label when it renders and again on every `setMessages` or `setLocale`, so the label follows the language.

```ts
const toolbar = createToolbar({ label: () => t('toolbar'), messages: viewer.messages })

definePlugin('review', (plugin) => {
  const notes = plugin.records<Note>('notes')

  plugin.command('suggest', () => t('suggest'), run, {
    errorStatus: () => t('suggest.failed'),
  })

  plugin.marks(notes, {
    rect: (n) => n.rect,
    label: (n) => t('note.label', { text: n.text }),
    card: (n) => ({
      title: () => t('note.title'),
      actions: [{ label: () => t('note.dismiss'), run: () => notes.remove(n.id) }],
    }),
  })
})
```

A card's `actions` is an array of `{ label, run }` so each label can be a function. The object form, with the label as the key, works for fixed text. See [Writing a plugin](https://inkbar.dev/pr-preview/pr-47/docs/guides/writing-a-plugin.md#cards).

## Key reference

Every message in the English set, by group. The table leaves out `lang`, which names the set's language and isn't a message. A function message shows its template, or its plural forms, with `{name}` for the values it receives. Your replacement for a function message takes the same params object.

### `viewer`

| Key | English |
| --- | ------- |
| `viewer.document` | Document |
| `viewer.loading` | Loading document… |
| `viewer.openFailed` | This document could not be opened. |
| `viewer.pageFailed` (function) | Page {page} could not be shown. |

### `toolbar`

| Key | English |
| --- | ------- |
| `toolbar.label` | Document tools |
| `toolbar.find` | Find |
| `toolbar.download` | Download |
| `toolbar.print` | Print |
| `toolbar.undo` | Undo |
| `toolbar.redo` | Redo |
| `toolbar.back` | Back |
| `toolbar.forward` | Forward |
| `toolbar.zoomIn` | Zoom in |
| `toolbar.zoomOut` | Zoom out |
| `toolbar.zoom` | Zoom |
| `toolbar.fitWidth` | Fit width |
| `toolbar.fitPage` | Fit page |
| `toolbar.zoomPercent` (function) | {percent}% |
| `toolbar.page` | Page |
| `toolbar.pageOf` (function) | of {total} |
| `toolbar.previousPage` | Previous page |
| `toolbar.nextPage` | Next page |

### `find`

| Key | English |
| --- | ------- |
| `find.field` | Find in document |
| `find.previous` | Previous match |
| `find.next` | Next match |
| `find.matchCase` | Match case |
| `find.close` | Close find |
| `find.noResults` | No results |
| `find.count` (function) | {current} of {total} |
| `find.countScanning` (function) | {current} of {total}… |
| `find.announce` (function) | Match {current} of {total}, page {page} |
| `find.announceScanning` (function) | Match {current} of {total} so far, page {page} |

### `search`

| Key | English |
| --- | ------- |
| `search.field` | Find in document |
| `search.placeholder` | Search for a word or phrase |
| `search.prompt` | Search to list every match. |
| `search.noResults` | No results |
| `search.resultCount` (function) | one: {count} result \| other: {count} results |
| `search.matchPage` (function) | Page {page} |
| `search.match` (function) | Match {index} |

### `records`

| Key | English |
| --- | ------- |
| `records.empty` | Nothing here yet. |
| `records.itemCount` (function) | one: {count} item \| other: {count} items |

### `sidebar`

| Key | English |
| --- | ------- |
| `sidebar.tab` (function) | {label}, {badge} |
| `sidebar.resizeLeft` | Resize left sidebar |
| `sidebar.resizeRight` | Resize right sidebar |

### `outline`

| Key | English |
| --- | ------- |
| `outline.label` | Outline |
| `outline.empty` | This document has no outline |

### `thumbnails`

| Key | English |
| --- | ------- |
| `thumbnails.page` (function) | Page {page} |

### `annotations`

| Key | English |
| --- | ------- |
| `annotations.highlight` | Highlight |
| `annotations.underline` | Underline |
| `annotations.strikeout` | Strikethrough |
| `annotations.squiggly` | Squiggly underline |
| `annotations.text` | Note |
| `annotations.freetext` | Text box |
| `annotations.square` | Rectangle |
| `annotations.circle` | Ellipse |
| `annotations.line` | Line |
| `annotations.polyline` | Polyline |
| `annotations.polygon` | Polygon |
| `annotations.ink` | Drawing |
| `annotations.stamp` | Stamp |
| `annotations.loupe` | Loupe |
| `annotations.mask` | Mask |
| `annotations.redact` | Redaction |
| `annotations.signature` | Signature |
| `annotations.withComment` (function) | {name} with comment |
| `annotations.byAuthor` (function) | {name} by {author} |

### `links`

| Key | English |
| --- | ------- |
| `links.unsupported` | This link is not supported |
| `links.goToLink` | Go to link |
| `links.goToPage` (function) | Go to page {page} |

### `tools`

| Key | English |
| --- | ------- |
| `tools.select-text` | Select text |
| `tools.select` | Rectangle select |
| `tools.draw` | Draw |
| `tools.shape` | Shape |
| `tools.note` | Add note |
| `tools.highlight` | Highlight |
| `tools.freetext` | Text box |
| `tools.sketch` | Sketch |
| `tools.signature` | Signature |
| `tools.redact-area` | Mark for redaction |

### `lineStyle`

| Key | English |
| --- | ------- |
| `lineStyle.label` | Line style |
| `lineStyle.weight` | Weight |
| `lineStyle.weightValue` (function) | {points} pt |
| `lineStyle.pattern` | Pattern |
| `lineStyle.solid` | Solid |
| `lineStyle.dashed` | Dashed |
| `lineStyle.arrowheads` | Arrowheads |
| `lineStyle.arrowNone` | No arrowheads |
| `lineStyle.arrowStart` | Arrowhead at start |
| `lineStyle.arrowEnd` | Arrowhead at end |
| `lineStyle.arrowBoth` | Arrowheads at both ends |

### `color`

| Key | English |
| --- | ------- |
| `color.border` | Border colour |
| `color.fill` | Fill colour |
| `color.textColor` | Text colour |
| `color.noFill` | No fill |
| `color.swatches` | Colours |
| `color.custom` | Custom… |
| `color.customColour` | Custom colour |

### `textStyle`

| Key | English |
| --- | ------- |
| `textStyle.label` | Text style |
| `textStyle.font` | Font |
| `textStyle.fontSize` | Font size |
| `textStyle.bold` | Bold |
| `textStyle.italic` | Italic |
| `textStyle.underline` | Underline |
| `textStyle.alignment` | Alignment |
| `textStyle.alignLeft` | Align left |
| `textStyle.alignCenter` | Align centre |
| `textStyle.alignRight` | Align right |
| `textStyle.alignJustify` | Justify |
| `textStyle.size` | Size |
| `textStyle.decrease` | Decrease font size |
| `textStyle.increase` | Increase font size |
| `textStyle.emphasis` | Emphasis |
| `textStyle.mixed` | Mixed |

### `highlight`

| Key | English |
| --- | ------- |
| `highlight.label` | Highlight |
| `highlight.choose` | Choose highlight |
| `highlight.menu` | Highlights |
| `highlight.kinds` | Kinds |
| `highlight.colour` | Colour |
| `highlight.highlightColour` | Highlight colour |
| `highlight.highlight` | Highlight |
| `highlight.underline` | Underline |
| `highlight.strikeout` | Strikethrough |
| `highlight.squiggly` | Squiggly underline |

### `shape`

| Key | English |
| --- | ------- |
| `shape.label` | Shape |
| `shape.choose` | Choose shape |
| `shape.menu` | Shapes |
| `shape.current` (function) | Shape: {kind} |
| `shape.line` | Line |
| `shape.arrow` | Arrow |
| `shape.rectangle` | Rectangle |
| `shape.roundedRectangle` | Rounded rectangle |
| `shape.ellipse` | Ellipse |
| `shape.bubble` | Speech bubble |
| `shape.star` | Star |
| `shape.polygon` | Polygon |
| `shape.loupe` | Loupe |
| `shape.mask` | Mask |
| `shape.ovalMask` | Oval mask |

### `notes`

| Key | English |
| --- | ------- |
| `notes.noteThread` | Note thread |
| `notes.commentThread` | Comment thread |
| `notes.anonymous` | Anonymous |
| `notes.close` | Close |
| `notes.comment` | Comment |
| `notes.reply` | Reply |
| `notes.delete` | Delete |
| `notes.deleteHighlight` | Delete highlight |

### `signature`

| Key | English |
| --- | ------- |
| `signature.sign` | Sign |
| `signature.trigger` | Choose signature |
| `signature.menu` | Signatures |
| `signature.saved` | Saved signatures |
| `signature.create` | Create signature |
| `signature.dialog` | Create signature |
| `signature.tabs` | Signature source |
| `signature.draw` | Draw |
| `signature.type` | Type |
| `signature.image` | Image |
| `signature.pad` | Signature pad |
| `signature.clear` | Clear |
| `signature.name` | Name |
| `signature.namePlaceholder` | Your name |
| `signature.fonts` | Font |
| `signature.file` | Image file |
| `signature.cancel` | Cancel |
| `signature.save` | Save |
| `signature.item` (function) | Signature {n} |
| `signature.remove` (function) | Remove signature {n} |
| `signature.imageTooLarge` | This image is too large. Choose a smaller one. |
| `signature.imageType` | Choose a PNG or JPEG image. |
| `signature.storageFull` | Your browser's storage is full. Remove a saved signature, or try a smaller one. |
| `signature.saveFailed` | The signature could not be saved. Try again. |
| `signature.removeFailed` | The signature could not be removed. Try again. |

### `password`

| Key | English |
| --- | ------- |
| `password.dialog` | Password required |
| `password.description` | This document is password protected. Enter its password to open it. |
| `password.field` | Password |
| `password.submit` | Open |
| `password.cancel` | Cancel |
| `password.incorrect` | Incorrect password. Try again. |
| `password.locked` | This document is password protected. |
| `password.unlock` | Enter password |

### `forms`

| Key | English |
| --- | ------- |
| `forms.unnamed` | Form field |
| `forms.sign` | Sign |
| `forms.signField` (function) | Sign this field: {label} |
| `forms.signFieldTitle` | Sign this field |
| `forms.alert` | Message |
| `forms.ok` | OK |

### `plugins`

| Key | English |
| --- | ------- |
| `plugins.commandFailed` | Something went wrong. |
