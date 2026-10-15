# Inkbar landing

Source for [inkbar.dev](https://inkbar.dev): the Inkbar landing page and documentation.

The Inkbar packages live in [inkbar/inkbar](https://github.com/inkbar/inkbar).

## Development

```sh
pnpm install
pnpm dev
```

## Build and preview

```sh
pnpm build
pnpm preview
```

The build writes the site to `dist/`. The preview serves it at http://localhost:4321.

Set `SITE_BASE` to build the site for a subdirectory, as the pull request previews at `inkbar.dev/pr-preview/pr-<number>/` are:

```sh
SITE_BASE=/pr-preview/pr-1/ pnpm build
```

## Tests

The browser tests run against the built site. Build first, then install the browser once.

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test:browser
```

Playwright starts the preview server for you.

## Checks

```sh
pnpm lint
pnpm format:check
pnpm typecheck
```
