import { satteri } from '@astrojs/markdown-satteri'
import starlight from '@astrojs/starlight'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'

import { baseLinks } from './src/markdown/base-links.ts'

// Pull request previews are served from /pr-preview/pr-<number>/; the site itself from the root.
const base = process.env.SITE_BASE ?? '/'

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
      plugins: [starlightLinksValidator()],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Introduction', slug: 'docs' },
            { label: 'Quickstart', slug: 'docs/quickstart' },
            { label: 'Loading assets', slug: 'docs/loading-assets' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Toolbars', slug: 'docs/guides/toolbars' },
            { label: 'Annotations', slug: 'docs/guides/annotations' },
            { label: 'Drawing', slug: 'docs/guides/drawing' },
            { label: 'Search', slug: 'docs/guides/search' },
            { label: 'Forms', slug: 'docs/guides/forms' },
            { label: 'Signatures', slug: 'docs/guides/signatures' },
            { label: 'Redaction', slug: 'docs/guides/redaction' },
            { label: 'Controlled mode', slug: 'docs/guides/controlled-mode' },
            { label: 'Plugins', slug: 'docs/guides/plugins' },
            { label: 'Writing a plugin', slug: 'docs/guides/writing-a-plugin' },
            { label: 'Theming', slug: 'docs/guides/theming' },
          ],
        },
        {
          label: 'Frameworks',
          items: [
            { label: 'Vue', slug: 'docs/frameworks/vue' },
            { label: 'React', slug: 'docs/frameworks/react' },
            { label: 'Svelte', slug: 'docs/frameworks/svelte' },
            { label: 'Plain DOM', slug: 'docs/frameworks/plain-dom' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Gloss format', slug: 'docs/reference/gloss' },
            { label: 'Theme tokens', slug: 'docs/reference/theme-tokens' },
            { label: 'Icons', slug: 'docs/reference/icons' },
          ],
        },
      ],
    }),
    svelte(),
  ],
})
