import { satteri } from '@astrojs/markdown-satteri'
import starlight from '@astrojs/starlight'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'
import starlightLlmsTxt from 'starlight-llms-txt'

import { fileURLToPath } from 'node:url'

import { docsIndex } from './src/lib/docs-index.ts'
import { sidebar } from './src/lib/docs-sidebar.ts'
import { siteUrl, twinPath } from './src/lib/markdown-twin.ts'
import { baseLinks } from './src/markdown/base-links.ts'

// Pull request previews are served from /pr-preview/pr-<number>/; the site itself from the root.
const base = process.env.SITE_BASE ?? '/'
const site = siteUrl(base)
/** @param {string} id a docs page id */
const twin = (id) => site + twinPath(id)

export default defineConfig({
  site: 'https://inkbar.dev',
  base,
  markdown: { processor: satteri({ hastPlugins: [baseLinks(base)] }) },
  integrations: [
    starlight({
      title: 'Inkbar',
      description:
        'Documentation for Inkbar, the open-source PDF viewer and editor for the web.',
      disable404Route: true,
      routeMiddleware: './src/route-data.ts',
      favicon: '/favicon.svg',
      components: {
        Header: './src/components/starlight/Header.astro',
        MarkdownContent: './src/components/starlight/MarkdownContent.astro',
        Footer: './src/components/starlight/Footer.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
      },
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://inkbar.dev/og.png' },
        },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      ],
      customCss: [
        '@fontsource-variable/urbanist/index.css',
        '@fontsource-variable/open-sans/index.css',
        '@fontsource-variable/geist-mono/index.css',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      editLink: { baseUrl: 'https://github.com/inkbar/landing/edit/main/' },
      plugins: [
        starlightLinksValidator(),
        // Writes /llms.txt, /llms-full.txt and /llms-small.txt from the docs, for AI assistants.
        starlightLlmsTxt({
          projectName: 'Inkbar',
          description:
            'Inkbar is an open-source PDF viewer and editor for the browser, with form filling, highlights, note threads, drawing, signatures and redaction marks. It is written in TypeScript, has bindings for Vue, React and Svelte, and is free under the MIT licence.',
          details: [
            '- Install it from npm: `@inkbar/core` and `@inkbar/theme`, plus `@inkbar/vue`, `@inkbar/react` or `@inkbar/svelte`. The plain DOM API in `@inkbar/core/dom` needs no framework.',
            '- Every editing tool is opt-in: pass the tool factories your toolbar offers as `tools`.',
            '- Inkbar renders documents in the browser and sends them nowhere.',
            '',
            `Start with the [Introduction](${twin('docs')}) and the [Quickstart](${twin('docs/quickstart')}). Every page below links to its Markdown.`,
            '',
            docsIndex(
              sidebar,
              fileURLToPath(new URL('./src/content/docs/', import.meta.url)),
              site
            ),
          ].join('\n'),
          // The docs in reading order, as the sidebar has them.
          promote: sidebar.flatMap(({ items }) => items.map(({ slug }) => slug)),
          // Starlight's heading anchors would add a "Section titled" line under every heading.
          customSelectors: { all: ['.sl-anchor-link'] },
          optionalLinks: [
            {
              label: 'Source code',
              url: 'https://github.com/inkbar/inkbar',
              description: 'the TypeScript source, issues and releases',
            },
            {
              label: 'Sandbox',
              url: 'https://sandbox.inkbar.dev',
              description: 'the viewers running on a sample document',
            },
          ],
        }),
      ],
      sidebar,
    }),
    svelte(),
  ],
})
