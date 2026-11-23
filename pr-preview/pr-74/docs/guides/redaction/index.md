# Redaction

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-74/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-74/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-74/docs/quickstart.md.

Mark text and areas for redaction, then apply the marks to remove the content under them from the file.

Redaction in Inkbar has two steps. People draw marks over what should go, then apply them. Applying removes the content under the marks, cleans parts of the file, checks the result and opens the redacted file in the viewer.

> **Caution:** A mark on its own removes nothing. The text under it still renders, and anyone can select and copy it. Download, Print and `doc.save()` write a mark into the PDF as a Redact annotation and leave the content under it in the file. Only applying the marks removes that content.

Applying needs `@inkbar/engine`. [Saving](https://inkbar.dev/pr-preview/pr-74/docs/guides/saving.md#turn-it-on) shows how to install it and pass it as `engine`. Inkbar loads the engine on the first apply, or on the first save that has changes.

## Drawing marks

Pass `redactAreaTool()` from `@inkbar/core/dom` in `tools` to offer the `redact-area` tool. Its tool button is labelled "Mark for redaction", and it makes two kinds of mark:

- **Area marks.** Drag a box over any part of the page, including images. With the `select` tool you can then move it and resize it by its corner handles, or from the keyboard.
- **Text marks.** Select text with the `select-text` tool, switch to `redact-area`, then click inside the selection or press `Enter`. The mark follows the lines of the selection.

Both are `redact` annotations. `interiorColor` is the colour of the box that replaces the content once the marks are applied. It defaults to `--ink-redact-fill`.

A mark from your own detector is a `redact` annotation too, added through the same API as any other annotation. Anything your review needs, such as a reason or a score, goes in the annotation's `custom` data.

## Applying marks

The Apply redactions button applies every mark in the session. It is disabled while no document is ready, without `engine`, and while there is no mark.

A press asks first, in a dialog titled "Apply redactions?". The dialog says:

- how many marks on how many pages will have the content under them removed,
- that this cannot be undone,
- how many other annotations go too, when the marks overlap any,
- that the signature will stop verifying, when the file is signed,
- how many marks saved earlier will be applied too, when an encrypted file holds them. Marks there from another program are left.

Focus starts on Cancel. If the marks change while the dialog is open, the viewer asks again about the marks there are now. If every mark has gone by then, nothing is applied. When the document closes or another one opens, the dialog closes and nothing is applied.

While the marks are applied, the button says "Applying redactions…" and keeps focus, and another press does nothing. The document takes no input: the pages take no presses or keys and do not scroll, undo and redo are off, an open comment thread closes, and Download and Print are disabled.

Once the apply succeeds:

- Your `onRedacted` callback (the `redacted` event in Vue) receives `{ bytes, result }`: the redacted file and what was done. A host that stores files stores these bytes.
- The viewer reopens on the redacted file with the same file name, page, zoom, layout, rotation and tool, and the password the file was opened with.
- The marks are gone and undo history starts again.
- Download and Print give the redacted file.
- The message box says how many redactions were applied. It adds a line when the file has hidden layers, and when marks from another program stayed locked and were left in place.

In [controlled mode](https://inkbar.dev/pr-preview/pr-74/docs/guides/controlled-mode.md), Inkbar proposes your list without the marks it applied and the annotations removed with them, with `reason: 'redaction'`, before the redacted file opens. A mark added while the apply runs stays in that list. With the framework packages' `history` on, your answer to that proposal starts the history; it is not an undo step.

## What applying removes

The engine works on the file as it was opened:

1. It removes the text, image samples and drawing under each mark, and leaves an opaque box in the mark's fill colour in its place, with the mark's overlay text if it has one.
2. It removes every annotation a mark overlaps, Inkbar's and the file's own, except masks and redaction marks from other programs that stayed locked. Then it writes the other annotations and the changed form values.
3. It removes the file's metadata, attached files, scripts, page thumbnails and private application data.
4. It rewrites the whole file, so no earlier version stays inside it.
5. It checks the saved bytes under each mark. The check reads the file's objects, so content hidden under an opaque box counts. When it finds anything, the apply fails and hands nothing over.

Marks Inkbar saved into the file earlier count as marks. In an encrypted file they come back locked, and the engine applies them too.

Unapplied Redact annotations from other programs open as marks and are applied with the rest. A few stay locked, and those stay in the file, unapplied, and are counted. [Saving](https://inkbar.dev/pr-preview/pr-74/docs/guides/saving.md#opening-a-saved-file) lists which.

The open document does not change. Its annotations, `doc.changed`, `doc.save()` and `doc.getData()` stay as they were; the viewer shows the redacted file by opening the new bytes.

## Marks the engine refuses

The apply removes text, blanks image samples and cuts paths. A file can also define content once and paint it through a reference, and cutting the shape that paints it would leave that content in the file. So before anything changes, the engine refuses a mark that touches:

- a shape painted with a tiling pattern, such as hatching or a texture,
- a picture gradient: a mesh or function-based gradient, or a linear or radial gradient whose colour function is not a simple ramp,
- artwork under a soft mask that holds more than a simple fade, which is how drop shadows and feathered edges are usually drawn,
- a Type 3 glyph that paints outside the box it declares.

A simple ramp blends from colour to colour in at most eight stretches. A simple fade is a soft mask made of at most four plain rectangles or simple-ramp gradients, which is how gradient transparency is drawn. Content under a simple fade, and linear and radial gradients with a simple ramp, are redacted.

Covering the whole shape does not help. When the engine refuses, nothing is changed, the viewer selects the refused marks, and the message box says how many marks cover content that cannot be removed. Move or delete those marks and apply again. When only marks saved earlier in an encrypted file caused the refusal, the viewer selects nothing and the message says one mark.

## Limits

Read these before you rely on a redacted file:

- Inkbar does not clean hidden layers. `result.hiddenLayers` says when the file has them, and the viewer's message says so too.
- The removed words may also appear where Inkbar does not look: bookmark titles, comments on other annotations, form values, and alternate text for screen readers.
- Inkbar removes what lies under a mark. It does not find copies of that content elsewhere in the file: a second use of the same graphic that is cropped, covered or on another page, or a pattern or gradient that another page also uses.
- A scanned page is one image. A mark removes the pixels under it, and there is no text to remove. OCR text layers are removed like any text.
- Scripts are removed, so forms stop calculating.
- A signed file's signature stops verifying.
- The engine refuses a mark over patterned fills, picture gradients, soft-masked artwork that holds more than a simple fade, and out-of-box Type 3 glyphs, even when the mark covers the whole shape.
- An Inkbar loupe that comes back locked, in an encrypted file or after another program edited it, keeps a copy of its page made before the apply. When that page has a mark and no mark overlaps the loupe, the check reads the copy, finds what lay under the mark, and the apply fails. Draw a mark over the loupe as well, and the apply removes it. For a loupe another program edited, you can also delete it in that program. For an encrypted file, you can also save a copy without the password in another program and redact that copy: Inkbar's loupes come back editable there, unless that program changed them, and the apply rewrites them.
- Text set at an angle close to a mark's edge can make the check fail, though the apply removed everything under the mark. Move the mark a little further from that text.
- The check also fails, and the reader sees "Some content could not be removed", for an image that has both a soft mask and a separate stencil mask. It can fail for a very low-quality JPEG.
- A crafted file can make the apply and its check take a long time.

The check after an apply is the engine reading the file it just wrote. It tells you what it found under each mark, within the limits above and those of [`checkRedaction`](#checking-a-file-from-elsewhere). Do not describe a file as safe because the apply succeeded.

## In each front end

`upload` in these examples stands for your own code that stores the redacted bytes.

### Plain DOM

`createApplyRedactionsButton(viewer)` is the button. `viewer.applyRedactions()` runs the same action from code and resolves with `result`, or with `null` when the reader cancelled, nothing was applied or the apply failed.

```ts
import {
  createApplyRedactionsButton,
  createToolbar,
  createToolButton,
  createViewer,
  redactAreaTool,
} from '@inkbar/core/dom'

const viewer = createViewer(el, {
  source,
  assets,
  tools: [redactAreaTool()],
  engine: () => import('@inkbar/engine'),
  onRedacted: ({ bytes }) => upload(bytes),
})

const bar = createToolbar()
bar.append(createToolButton(viewer, 'redact-area'), createApplyRedactionsButton(viewer))
viewer.element.prepend(bar)
```

### Vue

```vue
<script setup lang="ts">
import { redactAreaTool } from '@inkbar/core/dom'
import {
  InkApplyRedactions,
  InkRoot,
  InkToolbar,
  InkToolButton,
  InkViewport,
} from '@inkbar/vue'
import { assets } from 'virtual:inkbar-assets'

defineProps<{ file: File }>()

const tools = [redactAreaTool()]
const engine = () => import('@inkbar/engine')
</script>

<template>
  <InkRoot
    :src="file"
    :assets="assets"
    :tools="tools"
    :engine="engine"
    @redacted="({ bytes }) => upload(bytes)"
  >
    <InkToolbar>
      <InkToolButton tool="redact-area" />
      <InkApplyRedactions />
    </InkToolbar>
    <InkViewport />
  </InkRoot>
</template>
```

A `redacted` listener that throws goes to Vue's own error handling (`app.config.errorHandler` or `onErrorCaptured`), not to the `error` event, and the redacted file still opens.

### React

```tsx
import { redactAreaTool } from '@inkbar/core/dom'
import {
  InkApplyRedactions,
  InkRoot,
  InkToolbar,
  InkToolButton,
  InkViewport,
} from '@inkbar/react'
import { assets } from 'virtual:inkbar-assets'

const tools = [redactAreaTool()]
const engine = () => import('@inkbar/engine')

export function Viewer({ file }: { file: File }) {
  return (
    <InkRoot
      src={file}
      assets={assets}
      tools={tools}
      engine={engine}
      onRedacted={({ bytes }) => upload(bytes)}
    >
      <InkToolbar>
        <InkToolButton tool="redact-area" />
        <InkApplyRedactions />
      </InkToolbar>
      <InkViewport />
    </InkRoot>
  )
}
```

### Svelte

```svelte
<script lang="ts">
  import { redactAreaTool } from '@inkbar/core/dom'
  import {
    InkApplyRedactions,
    InkRoot,
    InkToolbar,
    InkToolButton,
    InkViewport,
  } from '@inkbar/svelte'
  import { assets } from 'virtual:inkbar-assets'

  let { file }: { file: File } = $props()

  const tools = [redactAreaTool()]
  const engine = () => import('@inkbar/engine')
</script>

<InkRoot src={file} {assets} {tools} {engine} onRedacted={({ bytes }) => upload(bytes)}>
  <InkToolbar>
    <InkToolButton tool="redact-area" />
    <InkApplyRedactions />
  </InkToolbar>
  <InkViewport />
</InkRoot>
```

In React and Svelte, when `onRedacted` throws, `onError` hears a `RedactionFailed` error with `details.callback` set to `'onRedacted'`, and the redacted file still opens.

### After the redacted file opens

In Vue, React and Svelte, `InkRoot` shows the redacted bytes in place of `src`, and `src` stays as you passed it. A new `src` opens as usual: a different `key`, or for a source without one, a different URL string, `File` or bytes object. Passing the stored bytes back under the same `key` reopens nothing.

### Your own confirmation

Pass `redactionConfirm` to `createViewer` or `InkRoot` (`redaction-confirm` in Vue) to ask your own way. It receives a preview and resolves `true` to apply. `false` applies without asking.

```ts
const viewer = createViewer(el, {
  source,
  assets,
  tools: [redactAreaTool()],
  engine: () => import('@inkbar/engine'),
  redactionConfirm: async (preview) =>
    window.confirm(
      `Remove the content under ${preview.marks} marks? This cannot be undone.`
    ),
})
```

The preview holds `marks`, `pages`, `overlapped` (the other annotations the marks overlap), `signed` and, in an encrypted file, `lockedMarks`.

### Your own button

`useRedaction()` gives the same action for a control of your own, inside `InkRoot`. `canRedact` and `busy` say when to disable it, and `apply()` resolves with `result`, or with `null` when the reader cancelled, nothing was applied or the apply failed. It never rejects for a failure the viewer has already shown. In Vue `canRedact` and `busy` are refs, in React they are booleans, and in Svelte you read them through the object `useRedaction()` returns.

```tsx
import { useRedaction } from '@inkbar/react'

function RedactButton() {
  const redaction = useRedaction()
  return (
    <button
      type="button"
      disabled={!redaction.canRedact || redaction.busy}
      onClick={() => void redaction.apply()}
    >
      Redact
    </button>
  )
}
```

`InkApplyRedactions` also takes your own content and your own element, as the other [toolbar controls](https://inkbar.dev/pr-preview/pr-74/docs/guides/toolbars.md#your-own-buttons) do.

### From the document

Without a viewer, `doc.redactionPreview()` gives the counts a confirmation needs without loading the engine, and `doc.applyRedactions()` applies every mark and resolves with `{ bytes, result }`. Open the bytes to show the redacted file.

```ts
const preview = doc.redactionPreview()
if (await ask(preview)) {
  const { bytes, result } = await doc.applyRedactions()
  await upload(bytes)
}
```

An apply never overlaps a save, and a second call while an apply runs gets the same promise.

## What `result` holds

- `marks` and `pages`: the marks applied and the pages they were on. A mark with no area, or wholly off its page, is skipped.
- `removed.session`: the ids of the session annotations removed with the content. `removed.file`: how many of the file's own annotations went, pop-up windows included.
- `foreignMarks`: other programs' Redact annotations that stayed locked and were left unapplied. `ownLockedMarks`: Inkbar's earlier marks applied in an encrypted file.
- `fieldsSkipped`: the names of changed form fields that were not written, because a mark removed their widgets.
- `sanitised`: what was removed from the file.
- `hiddenLayers` and `signed`: whether the file has hidden layers, and whether it held a digital signature.
- `findings`: what the check found under each mark. Findings hold places and verdicts, never the file's text.

## When applying fails

When the apply fails, nothing is handed over and the open document stays as it was. The viewer says why in its message box, and your error handler (`onError`, or the `error` event in Vue) hears one of these errors:

- `EngineUnavailable`: there is no `engine`.
- `NothingToRedact`: there is no mark, or the engine applied none because every mark has no area or lies wholly off its page.
- `RedactionFailed`: the engine could not finish. `details.stage` says where:
  - `'engine'` when the engine could not be loaded or started, as when offline.
  - `'apply'` when the engine refused the marks, or could not apply them or write the rest. `details.page` and `details.annotation` name the page and the annotation when one was the cause.
  - `'verify'` when the check could not run or did not find every mark's place clean. `details.regions` lists the page and rectangle of each place it did not find clean, and `details.page` names a page the check could not read.

A refusal has `details.reason: 'unremovable-content'`. `details.annotations` lists the ids of every refused mark, `details.annotation` holds the first, `details.kinds` says what was found (`'pattern'`, `'shading'`, `'mask-group'` or `'glyph'`) and `details.page` names the first page. When the engine could not look under the marks, `details.reason` is `'could-not-inspect'`.

The words in the button, the dialog and the message box are in the `viewer` group of messages, from `applyRedactions` to `redactForeign`. [Translations](https://inkbar.dev/pr-preview/pr-74/docs/guides/translations.md) lists them and shows how to change them.

## Checking a file from elsewhere

`checkRedaction` from `@inkbar/engine` reports what it finds under redactions in any PDF. Without `regions`, it looks for candidates itself: Redact annotations, filled boxes in the page content, and Square, Highlight and Stamp annotations drawn as one opaque filled box. That is the use for a file Inkbar did not just produce.

A crafted file can make the check take a long time, so run it on an engine of its own, in its own worker (the default in a browser), with a timeout, and destroy that engine when the timeout fires:

```ts
import { createEngine } from '@inkbar/engine'

const engine = await createEngine()
const timeout = setTimeout(() => void engine.destroy(), 30_000)
try {
  const { candidates, file } = await engine.checkRedaction(bytes)
  const flagged = candidates.filter((candidate) => candidate.verdict !== 'clean')
} finally {
  clearTimeout(timeout)
  await engine.destroy()
}
```

Each candidate gives its `page` and `rect`, its `kind`, whether `text`, `image` or `drawing` is present under it, and a `verdict`: `unapplied` for a Redact annotation with anything under it, `content-remains` for any other candidate with anything under it, and `clean` when the check found nothing under it. `file` counts the earlier versions and attached files the file keeps, and says whether it has metadata, scripts, hidden layers or a digital signature. Findings never hold text from the file.

`clean` means the check found nothing under that place. Without `regions`, the check reports only the redactions it recognises, and a filled box with nothing under it is `clean` whether it is a redaction or a graphic. A `check-failed` error means the check could not inspect a page or the file: treat it as a failed check, never as a finding of nothing. The [`@inkbar/engine` README](https://github.com/inkbar/inkbar/tree/main/packages/engine#checking-a-redaction) has the rules, the thresholds and the full list of limits.
