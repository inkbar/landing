import { expect, test } from '@playwright/test'

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

test('every docs page is served as Markdown, and its head points there', async ({
  page,
  request,
}) => {
  for (const path of ['/docs.md', '/docs/index.md', '/docs/quickstart.md']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type']).toContain('text/markdown')
  }
  const quickstart = await (await request.get('/docs/quickstart/index.md')).text()
  expect(quickstart).toMatch(/^# Quickstart\n/)
  expect(quickstart).not.toMatch(/^<(Tabs|TabItem|Aside|FrameworkSnippet)/m)

  await page.goto('/docs/guides/search/')
  await expect(
    page.locator('link[rel="alternate"][type="text/markdown"]')
  ).toHaveAttribute('href', /\/docs\/guides\/search\.md$/)
})
