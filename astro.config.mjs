import starlight from '@astrojs/starlight'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'

export default defineConfig({
  site: 'https://inkbar.dev',
  integrations: [
    starlight({
      title: 'Inkbar',
      description:
        'Documentation for Inkbar, the open-source PDF viewer and editor for the web.',
      disable404Route: true,
      favicon: '/favicon.svg',
      components: {
        Header: './src/components/starlight/Header.astro',
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
            { label: 'Annotations', slug: 'docs/guides/annotations' },
            { label: 'Controlled mode', slug: 'docs/guides/controlled-mode' },
            { label: 'Theming', slug: 'docs/guides/theming' },
          ],
        },
        {
          label: 'Frameworks',
          items: [
            { label: 'Vue', slug: 'docs/frameworks/vue' },
            { label: 'React', slug: 'docs/frameworks/react' },
            { label: 'Plain DOM', slug: 'docs/frameworks/plain-dom' },
          ],
        },
        {
          label: 'Reference',
          items: [{ label: 'Theme tokens', slug: 'docs/reference/theme-tokens' }],
        },
      ],
    }),
    svelte(),
  ],
})
