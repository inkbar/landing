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

## Use-case screenshots

The screenshots on the use-case pages come from the released `@inkbar` packages, not from drawings. After you upgrade those packages, capture them again:

```sh
pnpm exec playwright install chromium
pnpm screenshots
```

It captures each page twice: on a desktop screen as `src/assets/use-cases/<slug>.png`, and on a phone as `<slug>-phone.png`, which the pages show in a phone frame below 640px. Pass page slugs, such as `pnpm screenshots sign-pdfs`, to capture only those, and `--desktop` or `--phone` for one screen. Look at each image before you commit it.

The sample PDFs live in `scripts/screenshots/documents/`. `application.pdf` comes from `node scripts/screenshots/documents/application.ts`. `redactions.pdf`, `letter.pdf` and `handbook.pdf` are copies of the sandbox's made-up documents in [inkbar/inkbar](https://github.com/inkbar/inkbar) (`apps/sandbox/vite/documents/`). To make them again, run the sandbox's `makeDocument(name)` from `apps/sandbox` there and copy the bytes in.
