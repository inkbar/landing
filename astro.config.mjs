import starlight from '@astrojs/starlight'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

import inkbarInk from './src/shiki/inkbar-ink.json' with { type: 'json' }

export default defineConfig({
  site: 'https://inkbar.dev',
  integrations: [
    starlight({
      title: 'Inkbar',
      description:
        'Documentation for Inkbar, the open-source PDF viewer and editor for the web.',
      expressiveCode: { themes: [inkbarInk], styleOverrides: { borderRadius: '12px' } },
      disable404Route: true,
      favicon: '/favicon.svg',
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
      },
      customCss: [
        '@fontsource-variable/urbanist/index.css',
        '@fontsource-variable/open-sans/index.css',
        '@fontsource-variable/geist-mono/index.css',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      editLink: { baseUrl: 'https://github.com/inkbar/landing/edit/main/' },
      sidebar: [
        {
          label: 'Getting started',
          items: [{ label: 'Introduction', slug: 'docs' }],
        },
      ],
    }),
    svelte(),
  ],
})
