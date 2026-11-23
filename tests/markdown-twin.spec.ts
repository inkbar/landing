import { readdirSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import { sidebar } from '../src/lib/docs-sidebar'
import { siteUrl, toMarkdown, twinPath } from '../src/lib/markdown-twin'

const site = 'https://inkbar.dev/'
const twin = (body: string) =>
  toMarkdown({ id: 'docs/test', title: 'Test', body }, site)
    .split('\n\n')
    .slice(2)
    .join('\n\n')

test.describe('the Markdown twin', () => {
  test('lives beside the page and on the preview base', () => {
    expect(twinPath('docs/guides/search')).toBe('docs/guides/search.md')
    expect(siteUrl('/')).toBe('https://inkbar.dev/')
    expect(siteUrl('/pr-preview/pr-7/')).toBe('https://inkbar.dev/pr-preview/pr-7/')
  })

  test('opens with the title, the agent note and the description', () => {
    const markdown = toMarkdown(
      { id: 'docs/test', title: 'Test', description: 'What it covers.', body: 'Body.' },
      site
    )
    expect(markdown).toBe(
      [
        '# Test',
        '> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/docs/quickstart/ becomes https://inkbar.dev/docs/quickstart.md.',
        'What it covers.',
        'Body.\n',
      ].join('\n\n')
    )
  })

  test('points docs links at their twins and leaves code alone', () => {
    expect(
      twin(
        'See [Search](/docs/guides/search/#from-code), [home](/docs/) and `[x](/docs/a/)`.'
      )
    ).toBe(
      'See [Search](https://inkbar.dev/docs/guides/search.md#from-code), [home](https://inkbar.dev/docs.md) and `[x](/docs/a/)`.\n'
    )
    expect(twin('```md\n[x](/docs/a/)\n```')).toBe('```md\n[x](/docs/a/)\n```\n')
    expect(twin('A [CDN](//cdn.example.com/x.js) link.')).toBe(
      'A [CDN](//cdn.example.com/x.js) link.\n'
    )
  })

  test('drops imports and turns tabs into labelled blocks', () => {
    const body = [
      "import { TabItem, Tabs } from '@astrojs/starlight/components'",
      'import {',
      '  Aside,',
      "} from '@astrojs/starlight/components'",
      '',
      '<Tabs syncKey="framework">',
      '  <TabItem label="Vue">',
      '',
      '```vue',
      'import { ref } from "vue"',
      '',
      '',
      '<Thing />',
      '```',
      '',
      '  </TabItem>',
      '</Tabs>',
    ].join('\n')
    expect(twin(body)).toBe(
      '**Vue**\n\n```vue\nimport { ref } from "vue"\n\n\n<Thing />\n```\n'
    )
  })

  test('keeps prose that starts with "import"', () => {
    expect(twin('import the theme first.\n\nThen the rest.')).toBe(
      'import the theme first.\n\nThen the rest.\n'
    )
    expect(
      twin("import type { A } from 'a'\nimport 'b.css'\nimport X, { y } from 'c'\nKept.")
    ).toBe('Kept.\n')
    expect(() => twin('import {\n  a,\nprose')).toThrow('unexpected line in an import')
    expect(() => twin('import {\n  a,')).toThrow('unterminated import')
  })

  test('turns asides into quotes', () => {
    expect(twin(':::caution\nCareful.\n:::')).toBe('> **Caution:** Careful.\n')
    expect(twin('<Aside title="Heads up">\n  One\n  two.\n</Aside>')).toBe(
      '> **Heads up:** One\n> two.\n'
    )
    expect(twin('<Aside type="tip">\n- a\n</Aside>')).toBe('> **Tip:**\n>\n> - a\n')
  })

  test('writes out the components that draw generated content', () => {
    expect(twin('<FrameworkSnippet show="install" />')).toContain(
      '**Svelte**\n\n```sh\npnpm add @inkbar/svelte @inkbar/core @inkbar/theme\n```'
    )
    expect(twin('<FrameworkSnippet />')).toMatch(
      /^\*\*Vue\*\*, `Review\.vue`:\n\n```vue\n/
    )
    expect(twin('<IconGrid />')).toContain('| `TextCursor` | Select text tool |')
    expect(twin('<MessageKeys />')).toContain(
      '### `toolbar`\n\n| Key | English |\n| --- | ------- |\n| `toolbar.label` | Document tools |'
    )
  })

  test('refuses a component it has no Markdown for', () => {
    expect(() => twin('<NewThing />')).toThrow('docs/test: no Markdown for the component')
    expect(() => twin(':::note\n:::tip\n:::\n:::')).toThrow('nested aside')
    expect(() => twin(':::note\nOpen')).toThrow('unterminated aside')
  })
})

test('every docs page is served as Markdown, with no MDX left outside code', async ({
  request,
}) => {
  for (const { slug } of sidebar.flatMap(({ items }) => items)) {
    for (const path of [`/${slug}.md`, `/${slug}/index.md`]) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect(response.headers()['content-type'], path).toContain('text/markdown')
      const prose = (await response.text()).replace(
        /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm,
        ''
      )
      expect(prose, path).not.toMatch(/^\s*(<[A-Z]|<\/[A-Z]|:::|import\s.*\sfrom\s)/m)
      expect(prose, path).not.toMatch(/\]\(\/(?!\/)/)
    }
  }
})

test("a docs page's head points at its Markdown", async ({ page }) => {
  await page.goto('/docs/guides/search/')
  await expect(
    page.locator('link[rel="alternate"][type="text/markdown"]')
  ).toHaveAttribute('href', /\/docs\/guides\/search\.md$/)
})

// The changelog's twin exists only once the changelog has notes.
const changelogVersions = readdirSync(
  new URL('../src/content/changelog/', import.meta.url)
)
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -'.md'.length))

test('the changelog is served as Markdown and listed in llms.txt', async ({
  request,
}) => {
  test.skip(changelogVersions.length === 0, 'the changelog has no notes yet')
  const response = await request.get('/changelog.md')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/markdown')
  const markdown = await response.text()
  expect(markdown).toMatch(/^# Inkbar changelog\n/)
  for (const version of changelogVersions) expect(markdown).toContain(`## ${version} (`)
  expect(await (await request.get('/llms.txt')).text()).toContain(
    'https://inkbar.dev/changelog.md'
  )
})

test('with no notes there is no changelog twin or llms.txt link', async ({ request }) => {
  test.skip(changelogVersions.length > 0, 'the changelog has notes')
  expect((await request.get('/changelog.md')).status()).toBe(404)
  expect(await (await request.get('/llms.txt')).text()).not.toContain('changelog')
})
