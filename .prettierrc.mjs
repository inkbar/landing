import base from '@ecssc/prettier-config'

// The house config formats with the Tailwind plugin only. This site has no Tailwind and does
// have Astro and Svelte files, so the plugin list is replaced: the Tailwind plugin also fails
// on Svelte files when it runs with prettier-plugin-svelte 4.
export default {
  ...base,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-svelte'],
  overrides: [
    ...(base.overrides ?? []),
    { files: '*.astro', options: { parser: 'astro' } },
    { files: '*.svelte', options: { parser: 'svelte' } },
  ],
}
