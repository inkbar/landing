---
title: Loading assets
description: Serve the PDF.js worker, fonts and decoders with the Vite plugin or from your own server.
---

PDF.js needs a worker script plus directories of CMaps, standard fonts, WebAssembly decoders and ICC profiles. Inkbar loads them from URLs you pass as the `assets` option. The option has no default, because the right URLs depend on how you deploy your app.

## With Vite

Add the plugin:

```ts
// vite.config.ts
import { inkbar } from '@inkbar/core/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [inkbar()],
})
```

Then import the URLs from the virtual module:

```ts
import { assets } from 'virtual:inkbar-assets'
```

In development the plugin serves the files from `node_modules`. In a build it copies them into `<outDir>/inkbar/`. The URLs respect your `base`. With a relative `base` such as `./`, the plugin resolves the URLs at runtime from the location of your bundle, so the build works from any path. Pass `inkbar({ assetsDir: 'pdf' })` to use a different directory name.

For TypeScript, reference the module declaration once, for example in `env.d.ts`:

```ts
/// <reference types="@inkbar/core/vite/client" />
```

## Without Vite

Copy these from the installed `pdfjs-dist` package to a path your server exposes:

- `build/pdf.worker.min.mjs`
- `cmaps/`
- `standard_fonts/`
- `wasm/`
- `iccs/` (optional)

Pass their URLs. Directory URLs end in `/`:

```ts
const assets = {
  worker: '/pdfjs/pdf.worker.min.mjs',
  cMaps: '/pdfjs/cmaps/',
  standardFonts: '/pdfjs/standard_fonts/',
  wasm: '/pdfjs/wasm/',
  icc: '/pdfjs/iccs/',
}
```

Use the `pdfjs-dist` version that `@inkbar/core` depends on, so the worker matches the library.
