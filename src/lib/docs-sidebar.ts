/**
 * The docs sidebar, in reading order. astro.config.mjs builds Starlight's sidebar from this list,
 * and llms.txt lists the pages in the same order.
 */
export interface SidebarGroup {
  label: string
  items: { label: string; slug: string }[]
}

export const sidebar: SidebarGroup[] = [
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
      { label: 'Sidebars', slug: 'docs/guides/sidebars' },
      { label: 'Thumbnails', slug: 'docs/guides/thumbnails' },
      { label: 'Outline and links', slug: 'docs/guides/outline-and-links' },
      { label: 'Forms', slug: 'docs/guides/forms' },
      { label: 'Signatures', slug: 'docs/guides/signatures' },
      { label: 'Locked files', slug: 'docs/guides/locked-files' },
      { label: 'Redaction', slug: 'docs/guides/redaction' },
      { label: 'Controlled mode', slug: 'docs/guides/controlled-mode' },
      { label: 'Plugins', slug: 'docs/guides/plugins' },
      { label: 'Writing a plugin', slug: 'docs/guides/writing-a-plugin' },
      { label: 'Storage', slug: 'docs/guides/storage' },
      { label: 'Theming', slug: 'docs/guides/theming' },
      { label: 'Translations', slug: 'docs/guides/translations' },
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
]
