---
title: Redaction
description: Mark text and areas for redaction by hand.
---

Inkbar lets people mark what should be redacted. It does not yet remove anything from the file.

:::caution
A redaction mark is a tinted, outlined box over the content. The text under it still renders, anyone can select and copy it, and the PDF itself does not change. Removing the content needs saving into the PDF, which has not shipped. Do not share the original file as if it were redacted.
:::

Until then, the marks are a review record: who marked what, where and why. Export them as JSON with the rest of the annotations, or send them to a service that applies redactions on your server.

## Marking by hand

The `redact-area` tool, labelled "Mark for redaction" on its tool button, makes two kinds of mark:

- **Area marks.** Drag a box over any part of the page, including images. With the `select` tool you can then move it and resize it by its corner handles, or from the keyboard.
- **Text marks.** Select text with the `select-text` tool, switch to `redact-area`, then click inside the selection or press `Enter`. The mark follows the lines of the selection.

Both are `redact` annotations. `interiorColor` is the colour the area will be filled with once redactions are applied. It defaults to `--ink-redact-fill`.
