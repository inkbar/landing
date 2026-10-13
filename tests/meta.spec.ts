import { expect, test } from '@playwright/test'

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

test('the static files for the host and for crawlers are served', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain('Sitemap: https://inkbar.dev/sitemap-index.xml')
  expect(await robots.text()).not.toContain('Disallow: /')

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

test('the 404 page is kept out of the index', async ({ page }) => {
  await page.goto('/no-such-page/')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})
