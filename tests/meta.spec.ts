import { expect, test } from '@playwright/test'

import { sidebar } from '../src/lib/docs-sidebar'

test('the landing page carries its search and social metadata', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Inkbar: open-source PDF viewer and editor for the web')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://inkbar.dev/'
  )
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /MIT licence/
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://inkbar.dev/og.png'
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image'
  )
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
})

test('docs pages carry a canonical URL and the social image', async ({ page }) => {
  await page.goto('/docs/quickstart/')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://inkbar.dev/docs/quickstart/'
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://inkbar.dev/og.png'
  )
})

test('docs pages share under their full title', async ({ page }) => {
  // React's title is set in frontmatter; Plugins' is Starlight's default.
  for (const [path, title] of [
    ['/docs/frameworks/react/', 'React PDF viewer and editor | Inkbar'],
    ['/docs/guides/plugins/', 'Plugins | Inkbar'],
  ]) {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('h1')).not.toHaveText(title)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      title
    )
  }
})

// Search results cut a description off at about 160 characters, and a very short one wastes
// the snippet.
test('every page has a description that fits a search result', async ({ page }) => {
  const paths = [
    '/',
    '/docs/',
    ...sidebar.flatMap(({ items }) => items.map(({ slug }) => `/${slug}/`)),
  ]
  for (const path of [...new Set(paths)]) {
    await page.goto(path)
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content')
    expect(description?.length, path).toBeGreaterThanOrEqual(50)
    expect(description?.length, path).toBeLessThanOrEqual(160)
  }
})

test('the static files for the host and for crawlers are served', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain('Sitemap: https://inkbar.dev/sitemap-index.xml')
  expect(await robots.text()).not.toMatch(/^Disallow: \/$/m)
  expect(await robots.text()).toContain('Disallow: /pr-preview/')

  const cname = await request.get('/CNAME')
  expect((await cname.text()).trim()).toBe('inkbar.dev')

  const og = await request.get('/og.png')
  expect(og.status()).toBe(200)
  expect(og.headers()['content-type']).toContain('image/png')

  const sitemap = await request.get('/sitemap-index.xml')
  expect(sitemap.status()).toBe(200)
})

test('the sitemap lists the landing page and the Quickstart', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text()
  const first = /<loc>https:\/\/inkbar\.dev(\/sitemap-\d+\.xml)<\/loc>/.exec(index)?.[1]
  expect(first).toBeDefined()
  const sitemap = await (await request.get(first as string)).text()
  expect(sitemap).toContain('<loc>https://inkbar.dev/</loc>')
  expect(sitemap).toContain('<loc>https://inkbar.dev/docs/quickstart/</loc>')
})

test('every sitemap entry is dated', async ({ request }) => {
  const index = await (await request.get('/sitemap-index.xml')).text()
  const first = /<loc>https:\/\/inkbar\.dev(\/sitemap-\d+\.xml)<\/loc>/.exec(index)?.[1]
  const sitemap = await (await request.get(first as string)).text()
  const entries = sitemap.match(/<url>.*?<\/url>/g) ?? []
  expect(entries.length).toBeGreaterThan(20)
  for (const entry of entries) {
    expect(entry).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T[^<]+<\/lastmod>/)
  }
})

test('the 404 page is kept out of the index', async ({ page }) => {
  await page.goto('/no-such-page/')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})

test('llms.txt and its two documentation sets are served', async ({ request }) => {
  const index = await request.get('/llms.txt')
  expect(index.status()).toBe(200)
  const text = await index.text()
  expect(text).toMatch(/^# Inkbar\n\n> Inkbar is an open-source PDF viewer/)
  expect(text).toContain('https://inkbar.dev/llms-full.txt')
  expect(text).toContain('https://inkbar.dev/llms-small.txt')

  const full = await (await request.get('/llms-full.txt')).text()
  const headings = [...full.matchAll(/^# (.+)$/gm)].map(([, title]) => title)
  expect(headings.slice(0, 3)).toEqual(['Introduction', 'Quickstart', 'Loading assets'])
  expect(headings.at(-1)).toBe('Icons')
  expect(full).not.toContain('Section titled')

  expect((await request.get('/llms-small.txt')).status()).toBe(200)
})

test('llms.txt lists every docs page, linking to Markdown that is served', async ({
  request,
}) => {
  const text = await (await request.get('/llms.txt')).text()
  const pages = sidebar.flatMap(({ items }) => items)
  for (const { slug } of pages) {
    expect(text, slug).toContain(`(https://inkbar.dev/${slug}.md)`)
  }
  const links = new Set(
    [...text.matchAll(/\(https:\/\/inkbar\.dev\/(docs[^)]*\.md)\)/g)].map(
      ([, path]) => path
    )
  )
  expect(links.size).toBe(pages.length)
  for (const path of links) {
    expect((await request.get(`/${path}`)).status(), path).toBe(200)
  }
})

test('the home page and every docs page carry a note pointing agents at llms.txt', async ({
  request,
}) => {
  const paths = [
    '/',
    ...sidebar.flatMap(({ items }) => items.map(({ slug }) => `/${slug}/`)),
  ]
  for (const path of paths) {
    const html = await (await request.get(path)).text()
    const notes = html.match(/<p[^>]*data-agent-note[^>]*>[^<]*<\/p>/g) ?? []
    expect(notes, path).toHaveLength(1)
    expect(notes[0], path).toContain('aria-hidden="true"')
    expect(notes[0], path).toContain('https://inkbar.dev/llms.txt')
  }
})

test('the note for agents is hidden from readers', async ({ page }) => {
  for (const path of ['/', '/docs/', '/docs/guides/search/']) {
    await page.goto(path)
    const box = await page.locator('[data-agent-note]').boundingBox()
    expect(box?.width ?? 0, path).toBeLessThanOrEqual(1)
  }
})
