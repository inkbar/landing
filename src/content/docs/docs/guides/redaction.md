---
title: Redaction
description: Mark text and areas for redaction, feed in suggestions from your own detector, and review them before they count.
---

Inkbar lets people mark what should be redacted and review suggested redactions one by one. It does not yet remove anything from the file.

:::caution
A redaction mark is a tinted, outlined box over the content. The text under it still renders, anyone can select and copy it, and the PDF itself does not change. Removing the content needs saving into the PDF, which has not shipped. Do not share the original file as if it were redacted.
:::

Until then, the marks are a review record: who marked what, where and why. Export them as JSON with the rest of the annotations, or send them to a service that applies redactions on your server.

## Marking by hand

The `redact-area` tool, labelled "Mark for redaction" on its tool button, makes two kinds of mark:

- **Area marks.** Drag a box over any part of the page, including images. With the `select` tool you can then move it and resize it by its corner handles, or from the keyboard.
- **Text marks.** Select text with the `view` tool, switch to `redact-area`, then click inside the selection or press `Enter`. The mark follows the lines of the selection.

Both are `redact` annotations with `origin: 'user'`. `fill` is the colour the area will be filled with once redactions are applied. It defaults to `--ink-redact-fill`.

## Suggested redactions

A suggested redaction is a `redact` annotation with `origin: 'suggested'` and a `suggestion`. Inkbar has no detector of its own. Run yours, on your server or in the browser, and add what it finds:

```ts
doc.history.batch(() => {
  for (const match of matches) {
    doc.annotations.add({
      type: 'redact',
      page: match.page,
      quads: match.quads, // or rect for an area
      origin: 'suggested',
      suggestion: {
        confidence: match.confidence, // 0 to 1
        reason: 'Email address',
        explanation: `Matched ${match.text}`,
        recommendation: 'redact', // or 'review' or 'keep'
      },
    })
  }
})
```

`batch` makes the whole set one undo step. `doc.text(page)` returns a page's text runs with their positions in PDF user space, which is what you need to turn a match into quads.

The [sandbox](https://sandbox.inkbar.dev) has a working example: its "Suggest redactions" button runs a small pattern matcher for email addresses, UK phone numbers and National Insurance numbers. The source is in [`apps/sandbox/src/shared/suggest.ts`](https://github.com/inkbar/inkbar/blob/main/apps/sandbox/src/shared/suggest.ts).

## Reviewing suggestions

Each suggestion takes its colour from its confidence: below 0.5 is low, below 0.8 is medium, and the rest are high. The colours come from `--ink-suggestion-low`, `--ink-suggestion-medium` and `--ink-suggestion-high`, and the mark carries `data-origin="suggested"` and `data-confidence="low|medium|high"` for your own CSS.

Activating a suggestion opens `InkSuggestionCard` (or the card `createViewer` adds). It shows the reason, the confidence level and the explanation, with two actions:

- **Accept** turns it into an ordinary mark: `origin` becomes `'user'` and it takes the normal redaction colour. It keeps its `suggestion`, so you can still see where it came from.
- **Dismiss** removes it.

Both are undoable. To do the same from your own UI, call `accept(id)` and `dismiss(id)` from `useAnnotations()`, or `acceptSuggestion(doc.annotations, id)` from `@inkbar/core`.

To render the card yourself, pass a function or snippet as its child. It receives `annotation`, `suggestion`, `bucket`, `accept`, `dismiss` and `close`, typed as `SuggestionCardSlotProps`.
