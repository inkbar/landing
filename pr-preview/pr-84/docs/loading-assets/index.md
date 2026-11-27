# Loading assets

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-84/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-84/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-84/docs/quickstart.md.

Serve Inkbar's engine, fallback fonts and form script sandbox with the Vite plugin or from your own server.

Inkbar loads its own files at runtime: the engine's binary and worker, which read and draw every file, fallback fonts for text a file does not embed, and the sandbox that runs a form's scripts. It loads them from URLs you pass as the `assets` option. The option has no default, because the right URLs depend on how you deploy your app.

Opening a file loads about 735 KB of JavaScript (240 KB gzipped), the engine's worker included, and the engine's 7.1 MB binary (3.0 MB gzipped). A font is fetched only when a page needs it, and the sandbox only when a file has scripts.

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

In development the plugin serves the files from `node_modules`. In a build it copies them into `<outDir>/inkbar/<version>/`, where `<version>` is the installed `@inkbar/core` version, so a file a browser has cached is never served for a later release. The URLs respect your `base`. With a relative `base` such as `./`, the plugin resolves the URLs at runtime from the location of your bundle, so the build works from any path. Pass `inkbar({ assetsDir: 'pdf' })` to use a different directory name in place of `inkbar`.

For TypeScript, reference the module declaration once, for example in `env.d.ts`:

```ts
/// <reference types="@inkbar/core/vite/client" />
```

## Without Vite

Copy these files to a path your server exposes. Take each from the package `@inkbar/core` depends on, at the version it installs. A package manager that does not hoist dependencies, such as pnpm, keeps those packages beside `@inkbar/core` rather than at the top of `node_modules`.

| File                                                                                                                                                         | From             | Copy to    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------- |
| `dist/inkbar-pdfium.wasm`                                                                                                                                    | `@inkbar/engine` | `./`       |
| `dist/worker.mjs`                                                                                                                                            | `@inkbar/engine` | `./`       |
| `files/NotoSans-Regular.ttf`, `files/NotoSansJP-Regular.otf`, `files/NotoSansKR-Regular.otf`, `files/NotoSansSC-Regular.otf`, `files/NotoSansTC-Regular.otf` | `@inkbar/fonts`  | `fonts/`   |
| `wasm/quickjs-eval.js`, `wasm/quickjs-eval.wasm`                                                                                                             | `pdfjs-dist`     | `sandbox/` |

Put them under a directory named for the installed `@inkbar/core` version, as the plugin does, so a cached file is never stale after an upgrade. Then pass their URLs:

```ts
const base = '/inkbar/<version>/' // the installed @inkbar/core version

const assets = {
  engine: `${base}inkbar-pdfium.wasm`,
  worker: `${base}worker.mjs`,
  fonts: `${base}fonts/`,
  sandbox: `${base}sandbox/`,
}
```

- `engine` is the URL of `inkbar-pdfium.wasm`.
- `worker` is the URL of `worker.mjs`. A browser starts a worker only from the page's own origin, so serve `worker.mjs` from the page's origin even when the other files come from elsewhere, such as a CDN.
- `fonts` is the URL of the directory holding the five fonts. Pass one URL per font instead, as `{ default, japanese, 'simplified-chinese', 'traditional-chinese', korean }`, to name each file yourself or to leave some out. Pass `false` for no fallback fonts: Latin text in the standard fonts still draws, but Chinese, Japanese, Korean, Cyrillic or Greek text in a font the file does not embed draws wrong or not at all. Each Chinese, Japanese or Korean font is 4 to 8 MB.
- `sandbox` is the URL of the directory holding `quickjs-eval.js` and `quickjs-eval.wasm`.

## When a file cannot load

- A key that is missing or of the wrong type fails the open with `AssetConfigMissing`, and `details.key` names it.
- When the engine's binary or worker cannot be fetched or started, the open fails with `AssetLoadFailed`.
- A font that cannot be fetched is reported with `console.warn`, and its text draws with a substitute.
- When the sandbox cannot be loaded, the form stays fillable and its scripts do not run. Your error handler hears a `FormScriptError`.

In Node, `engine` may be a file path or a `file:` URL, and `worker` is ignored, since the engine runs in the calling thread. Form scripts do not run in Node.

## Licences

Each file keeps the licence of its package. The engine's binary is PDFium and the libraries linked into it, listed in `dist/THIRD-PARTY-NOTICES` of `@inkbar/engine`. The fonts are under the SIL Open Font License, in `OFL.txt` of `@inkbar/fonts`. The sandbox files come with `pdfjs-dist` under the Apache License 2.0, in its `LICENSE`.
