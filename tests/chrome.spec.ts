import { expect, test, type Page } from '@playwright/test'

import { expectNoAxeViolations } from './helpers'

/** The site header's links, in order, by accessible name and where they go. */
async function headerLinks(page: Page): Promise<[string, string | null][]> {
  const links = page.getByRole('navigation', { name: 'Site' }).getByRole('link')
  const out: [string, string | null][] = []
  for (const link of await links.all()) {
    out.push([(await link.textContent())?.trim() ?? '', await link.getAttribute('href')])
  }
  return out
}

const GITHUB = 'https://github.com/inkbar/inkbar'

test('the landing header links to pages, not to sections of the home page', async ({
  page,
}) => {
  await page.goto('/')
  expect(await headerLinks(page)).toEqual([
    ['Docs', '/docs/'],
    ['Use cases', '/use-cases/'],
    ['Changelog', '/changelog/'],
    ['Sandbox', 'https://sandbox.inkbar.dev'],
    ['Get started', '/docs/quickstart/'],
    ['GitHub', GITHUB],
  ])
})

test('the GitHub link is the logo on a wide screen and the word on a phone', async ({
  page,
}) => {
  await page.goto('/use-cases/')
  const github = page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('link', { name: 'GitHub', exact: true })
  const phone = (page.viewportSize()?.width ?? 0) < 640
  await expect(github.locator('svg')).toBeVisible({ visible: !phone })
  // On a wide screen the word is there for screen readers only, a 1px box.
  const word = await github.getByText('GitHub').boundingBox()
  expect((word?.width ?? 0) > 2).toBe(phone)
})

test('the footer credits Redactr once and never mentions Pro', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toContainText('From the team behind Redactr')
  await expect(footer.getByRole('link', { name: 'Redactr' })).toHaveAttribute(
    'href',
    'https://redactr.io'
  )
  await expect(page.locator('body')).not.toContainText(/\bPro\b/)
  const text = (await page.locator('body').textContent()) ?? ''
  expect(text.match(/Redactr/g) ?? []).toHaveLength(1)
})

test('the docs use the site header with search and mark Docs as current', async ({
  page,
}) => {
  await page.goto('/docs/')
  const nav = page.getByRole('navigation', { name: 'Site' })
  await expect(nav.getByRole('link', { name: 'Docs' })).toHaveAttribute(
    'aria-current',
    'page'
  )
  expect(await headerLinks(page)).toEqual([
    ['Docs', '/docs/'],
    ['Use cases', '/use-cases/'],
    ['Changelog', '/changelog/'],
    ['GitHub', GITHUB],
  ])
  await expect(
    page.getByRole('banner').getByRole('button', { name: /search/i })
  ).toBeVisible()
  await expect(page.locator('body')).toContainText('From the team behind Redactr')
})

test('the docs have no theme switch', async ({ page }) => {
  await page.goto('/docs/')
  await expect(page.locator('starlight-theme-select')).toHaveCount(0)
})

test.describe('with a dark system preference and a stored dark theme', () => {
  test.use({ colorScheme: 'dark' })

  test('the docs still render light', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('starlight-theme', 'dark'))
    await page.goto('/docs/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    const background = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    )
    expect(background).toBe('rgb(255, 255, 255)')
  })
})

test('an unknown URL shows the 404 page with the site header', async ({ page }) => {
  const response = await page.goto('/no-such-page/')
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Quickstart' })).toHaveAttribute(
    'href',
    '/docs/quickstart/'
  )
  await expectNoAxeViolations(page)
})
