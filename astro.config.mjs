import starlight from '@astrojs/starlight'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://inkbar.dev',
  integrations: [
    starlight({
      title: 'Inkbar',
      description:
        'Documentation for Inkbar, the open-source PDF viewer and editor for the web.',
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
