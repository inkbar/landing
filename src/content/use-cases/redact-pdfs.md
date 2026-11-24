---
title: Add PDF redaction to your web app | Inkbar
description: Let people mark text and areas in a PDF and remove what lies under them, in the browser. Open source and free, for Vue, React, Svelte or plain TypeScript.
heading: Let people [redact] PDFs without leaving your app
mark: redact
summary: Mark text and areas, then remove what lies under them and check the file it wrote.
focus: 50% 62%
address: app.example.com/customers/C-30918/redact
lede: Your users mark the names, numbers and passages that have to go, then apply the marks. Inkbar removes the content under them, checks the file it wrote and opens the redacted copy in the same viewer.
screenshot: ../../assets/use-cases/redact-pdfs.png
alt: A page of customer records in the Inkbar viewer with three redaction marks over an NI number, an email address and a postal address, and a dialog asking to apply redactions to 3 marks on 1 page.
guide: redaction
label: Redact PDFs
order: 1
users:
  - Drag a box over any part of a page, images included, or select text and mark it.
  - Press Apply redactions and confirm in a dialog that says how many marks on how many pages will go, and that it cannot be undone.
  - Keep working on the redacted file, which opens at the same page and zoom. Download and Print give the redacted copy.
app:
  - The redacted file as bytes, through `onRedacted`, to store wherever your app keeps files.
  - Marks from your own detector, added through the same API as any other annotation, with your review data alongside.
  - A check after every apply. The engine reads the file it just wrote under each mark, and when it finds anything left, the apply fails and hands nothing over.
  - Applying also strips the file's metadata, attached files, scripts and page thumbnails, and rewrites the whole file so no earlier version stays inside it.
notes:
  - heading: The limits
    text: Read these before you rely on a redacted file. Inkbar does not clean hidden layers. The removed words can still appear in bookmark titles, comments on other annotations, form values and alternate text. A scanned page has no text to remove, only the pixels under the mark. A signed file's signature stops verifying. Inkbar removes what lies under each mark and does not look for copies of that content elsewhere in the file. The check after an apply has limits too, so don't describe a file as safe because the apply succeeded. The [Redaction guide](/docs/guides/redaction/#limits) lists every limit.
example: |
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
  bar.append(
    createToolButton(viewer, 'redact-area'),
    createApplyRedactionsButton(viewer)
  )
  viewer.element.prepend(bar)
---
