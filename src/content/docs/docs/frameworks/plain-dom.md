---
title: Plain DOM
description: Use Inkbar without a framework package through the core and its DOM layer.
---

`@inkbar/core` has three entry points:

- `@inkbar/core` holds the document model and annotation store. It is safe to import during server rendering.
- `@inkbar/core/dom` renders pages, text layers and annotation layers into the DOM.
- `@inkbar/core/vite` is a Vite plugin that serves the PDF.js assets.

## Usage

```ts
import { openDocument } from '@inkbar/core'
import { assets } from 'virtual:inkbar-assets' // from the Vite plugin, see Loading assets

const doc = await openDocument(file, { assets })
await doc.ready

doc.annotations.add({ type: 'highlight', page: 0, quads })
const json = doc.exportAnnotations('json')
```

The DOM layer (`@inkbar/core/dom`) provides the viewport, canvas renderer, text layer, overlay and tools for hosts without a framework package. Vue hosts should use `@inkbar/vue`, React hosts `@inkbar/react`.
