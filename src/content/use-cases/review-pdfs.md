---
title: Review and comment on PDFs in your app | Inkbar
description: Let people highlight PDFs and discuss them in comment threads with replies, in the browser, and keep every comment in your own backend. Open source and free.
heading: Review and comment on PDFs in your app
lede: People highlight passages, pin notes to the page and reply to each other in a thread beside the text. Your app stores the comments wherever it keeps its data.
screenshot: ../../assets/use-cases/review-pdfs.png
alt: A field handbook in the Inkbar viewer with two highlighted passages and an open comment thread, where Sam Rivera asks a question and Alex Sample replies.
guide: annotations
label: Review PDFs
order: 4
---

## What your users can do

- Highlight text by selecting it with the Highlight tool on, or select it and press Enter.
- Pin a note to the page, then reply, edit and delete in a thread beside it. Each comment shows its author and when it was written.
- Read the comments a PDF already holds from other programs. They show locked, so nobody moves or deletes them by mistake.

## What your app gets

- Annotations as plain typed objects, each with its author, its text and the comment it replies to.
- A change event for every add, edit and delete, so your app can send each one to its backend and keep other people's copies up to date.
- An export and import as JSON with a published schema. Or, with `@inkbar/engine`, the comments written into the PDF itself.

Inkbar does not sync comments between people on its own. Your app moves them through its own backend, which keeps who sees what in your hands.

## What it costs

Inkbar is open source under the MIT licence. There is no licence fee and no per-seat price.

## A short example

Store a document's comments in your backend, and load them back the next time it opens. `doc` is the open document:

```ts
const data = doc.exportAnnotations('json')
await saveToYourBackend(doc.key, data)

// On the next open
doc.importAnnotations(await loadFromYourBackend(doc.key), { mode: 'replace' })
```

The same viewer comes as components for [Vue](/docs/frameworks/vue/), [React](/docs/frameworks/react/) and [Svelte](/docs/frameworks/svelte/).
