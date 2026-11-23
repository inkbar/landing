# Saving

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-65/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-65/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-65/docs/quickstart.md.

Write annotations and form values into the PDF with @inkbar/engine, so Download, Print and doc.save() give the file as it looks on screen.

Inkbar writes a session's annotations and changed form values into the PDF. Download, Print and `doc.save()` then give a file that looks as it does on screen, and other programs can read what was added. Open that file in Inkbar again and its annotations come back ready to edit.

Saving is opt-in. It needs `@inkbar/engine`, a build of PDFium that runs in the browser. The same engine [applies redactions](https://inkbar.dev/pr-preview/pr-65/docs/guides/redaction.md). Without it, Download and Print give the file as it was opened, and redaction marks cannot be applied.

## Turn it on

Install the engine:

```sh
pnpm add @inkbar/engine
```

Then pass a function that imports it as `engine`:

**Vue**

```vue
<script setup lang="ts">
const engine = () => import('@inkbar/engine')
</script>

<template>
  <InkRoot :src="url" :assets="assets" :engine="engine">
    <!-- … -->
  </InkRoot>
</template>
```

**React**

```tsx
const engine = () => import('@inkbar/engine')

<InkRoot src={url} assets={assets} engine={engine}>
  {/* … */}
</InkRoot>
```

**Svelte**

```svelte
<script lang="ts">
  const engine = () => import('@inkbar/engine')
</script>

<InkRoot src={url} {assets} {engine}>
  <!-- … -->
</InkRoot>
```

**Plain DOM**

```ts
const viewer = createViewer(el, {
  source,
  assets,
  engine: () => import('@inkbar/engine'),
})
```

The download and print buttons, Ctrl or Cmd+S and Ctrl or Cmd+P then hand over the file with the session's changes written into it. `doc.save()` resolves with the same bytes.

Inkbar loads the engine on the first save that has changes, or the first apply of redactions. A visit that does neither never loads it, and a save with no changes gives the bytes the file was opened from. The engine's binary is 2.9 MB gzipped. A bundler picks up its wasm and worker from the package, so there is nothing to set up. To serve those files from a path of your own, see the [`@inkbar/engine` README](https://github.com/inkbar/inkbar/tree/main/packages/engine#serving-the-files).

Inkbar reads `engine` when a document opens. Without it, `doc.save()` rejects with `EngineUnavailable` once there are changes. With or without it, `doc.getData()` gives the bytes the file was opened from.

`doc.changed` is a readable that is true while the session differs from the file: its annotations from those it opened with, or a form value from the file's. The file's values are the ones the form holds when `ready` resolves. A value you set after that is a change, and so is one you pass at open.

### Opening documents yourself

A host that calls `openDocument` itself passes one more option, `pictures`. In a browser, `savePictures(document)` from `@inkbar/core/dom` supplies it. `createViewer` and the framework packages pass it for you.

```ts
import { openDocument } from '@inkbar/core'
import { savePictures } from '@inkbar/core/dom'

const doc = await openDocument(file, {
  assets,
  engine: () => import('@inkbar/engine'),
  pictures: savePictures(document),
})
```

`pictures` gives a save three things from the browser: a picture of each line of text the standard fonts cannot set, a PNG copy of an image that is neither PNG nor JPEG, and the text widths the screen uses. Without it, a save lays text out with the standard fonts' own widths, so a line can break at a different word in the file than on screen. A text box with Chinese, Arabic or emoji text then fails the save with `SaveFailed`, and so does a stamp whose image is WebP.

## What goes into the file

- Each annotation becomes a standard PDF annotation that other programs can list, select and delete. A highlight is a Highlight, a note a Text annotation, a text box a FreeText and a drawing an Ink annotation. A loupe or a mask becomes a Stamp. A comment goes in the annotation's contents, and replies are saved as replies.
- Each annotation's look is drawn from the same description the screen uses, so it matches what you see in Inkbar, apart from [the differences below](#where-the-saved-file-differs-from-the-screen).
- Changed form values. Fields you did not change keep the look they came with.
- A redaction mark becomes a Redact annotation. A save does not apply it.

> **Caution:** Saving does not redact. The text and images under a redaction mark are still in the saved file, and anyone can copy them. Applying the marks removes them: see [Redaction](https://inkbar.dev/pr-preview/pr-65/docs/guides/redaction.md).

An encrypted file keeps its password. With `engine`, the open document holds the password until it closes, because a save opens the file again in the engine.

### Signed files

A file with a digital signature is saved by appending the changes after the signed bytes, so the signature still verifies. Other viewers report that the file changed after signing. Any other file is rewritten.

Appending keeps the earlier versions of a signed file inside it. If you delete or edit an annotation that an earlier Inkbar save wrote into a signed file, a reader can still recover the old one from the earlier version. A rewrite drops it.

### Loupes

A saved loupe holds a copy of its whole page's content, fonts and images included, and shows the part under the lens. If you redact that page later in another tool, the original content stays in the file inside the loupe. When Inkbar [applies redactions](https://inkbar.dev/pr-preview/pr-65/docs/guides/redaction.md), every loupe it writes gets a copy of the redacted page. A loupe that stays locked keeps its old copy, and the apply then fails ([the limits](https://inkbar.dev/pr-preview/pr-65/docs/guides/redaction.md#limits) say what to do). On a page with large images the copy also adds to the file's size.

## Opening a saved file

Annotations Inkbar saved come back as session annotations, with the same ids, ready to edit. Saving again replaces them, so each one is in the file once. They are not an undo step and do not count as a change.

They arrive a moment after `ready`, as one `replace` change with `reason: 'file'`. Until then the file's copy shows, locked. A signature saved on a signature field comes back on the field, and the field shows as signed.

In [controlled mode](https://inkbar.dev/pr-preview/pr-65/docs/guides/controlled-mode.md), `onChange` proposes them once, with `reason: 'file'`: your list with the saved annotations added. Apply that proposal as you apply any other, by pushing the list back. Until you push a list, the viewer does not show the saved annotations, and each save still keeps them in the file. The framework packages' undo history takes your answer as its starting point, so undo does not remove them.

Some annotations stay locked:

- Annotations made by other programs.
- An annotation Inkbar saved that another program has since moved, edited, replied to or given a pop-up window. Inkbar's own replies to a note that stays locked stay locked with it.
- Inkbar's own annotations in an encrypted file.

## Where the saved file differs from the screen

- Text with characters outside the standard fonts, such as Chinese, Arabic or emoji, is saved as a picture of the line, at four pixels per point. It blurs at high zoom and cannot be selected. The annotation's contents keep the text.
- The standard fonts (Helvetica, Times and Courier) are not embedded, so each viewer draws them with its own equivalent. Widths match, and letter shapes can differ slightly.
- A note's drop shadow is not saved.
- A loupe in the saved file magnifies the page's content only. It leaves out the annotations and form fields under it.
- Form fields look as the engine draws them, which can differ from how Inkbar draws them on screen.
- Another viewer may redraw an annotation its user edits there.
- The file grows a little each time it is saved and opened again: about 1.5 KB for a file with eighteen annotations. Saving several times in one session does not add to it.

XFA forms are not supported.

## When a save fails

When the engine cannot be loaded or cannot write the file, `doc.save()` rejects with `SaveFailed`:

- `details.stage` is `'engine'` when the engine could not be loaded or started, as when offline.
- `details.stage` is `'write'` when the engine could not open or write this file.
- `details.annotation` holds an annotation's id when that annotation is the cause.

Download and Print then hand over nothing. The viewer says why in its message box, and your error handler (`onError`, or the `error` event in Vue) hears the error.

While a copy is being written, the download and print buttons show they are busy, and another press does nothing. Inkbar keeps the written copy until the next change, so Print after Download does not write the file twice.

The three messages are `saveFailed`, `saveUnavailable` and `preparingFile`, in the `viewer` group. [Translations](https://inkbar.dev/pr-preview/pr-65/docs/guides/translations.md) shows how to change them.

## Without the engine

You can still keep a session without writing into the PDF. Store the annotations and form values as JSON in your own backend and import them on the next open: [Annotations](https://inkbar.dev/pr-preview/pr-65/docs/guides/annotations.md#saving-annotations) and [Forms](https://inkbar.dev/pr-preview/pr-65/docs/guides/forms.md#save-values-as-gloss) show how.
