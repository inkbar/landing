import { expect, test } from '@playwright/test'

import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers'

const pages = [
  { path: '/docs/', title: 'Introduction' },
  { path: '/docs/quickstart/', title: 'Quickstart' },
  { path: '/docs/loading-assets/', title: 'Loading assets' },
  { path: '/docs/guides/toolbars/', title: 'Toolbars' },
  { path: '/docs/guides/annotations/', title: 'Annotations' },
  { path: '/docs/guides/redaction/', title: 'Redaction' },
  { path: '/docs/guides/controlled-mode/', title: 'Controlled mode' },
  { path: '/docs/guides/theming/', title: 'Theming' },
  { path: '/docs/frameworks/vue/', title: 'Vue' },
  { path: '/docs/frameworks/react/', title: 'React' },
  { path: '/docs/frameworks/svelte/', title: 'Svelte' },
  { path: '/docs/frameworks/plain-dom/', title: 'Plain DOM' },
  { path: '/docs/reference/theme-tokens/', title: 'Theme tokens' },
]

for (const { path, title } of pages) {
  test(`${path} renders, fits a phone and marks itself in the sidebar`, async ({
    page,
  }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('heading', { level: 1, name: title, exact: true })
    ).toBeVisible()
    await expectNoHorizontalScroll(page)
    // Starlight labels its sidebar navigation "Main"; the site header's navigation is "Site".
    await expect(
      page.locator(`nav[aria-label="Main"] a[aria-current="page"][href="${path}"]`)
    ).toHaveCount(1)
  })
}

test('the Quickstart has three numbered steps and a Next section', async ({ page }) => {
  await page.goto('/docs/quickstart/')
  const headings = await page.locator('main h2').allTextContents()
  expect(headings.map((text) => text.trim())).toEqual([
    '1. Install the packages',
    '2. Add the Vite plugin',
    '3. Mount the viewer',
    'Next',
  ])
  await expect(page.locator('main')).toContainText(
    "import { inkbar } from '@inkbar/core/vite'"
  )
})

test('choosing a framework on the Quickstart changes both tab sets', async ({ page }) => {
  await page.goto('/docs/quickstart/')
  await page.evaluate(() => customElements.whenDefined('starlight-tabs'))
  await page.getByRole('tab', { name: 'Svelte' }).first().click()
  const selected = page.getByRole('tab', { name: 'Svelte', selected: true })
  await expect(selected).toHaveCount(2)
  await expect(page.locator('main')).toContainText(
    'pnpm add @inkbar/svelte @inkbar/core @inkbar/theme'
  )
  await expect(page.locator('main')).toContainText("from '@inkbar/svelte'")
})

for (const { path } of pages) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path)
    await expectNoAxeViolations(page)
  })
}

test('tables in the docs take keyboard focus', async ({ page }) => {
  await page.goto('/docs/guides/annotations/')
  const tables = page.locator('main table')
  expect(await tables.count()).toBeGreaterThan(0)
  for (const table of await tables.all()) {
    await expect(table).toHaveAttribute('tabindex', '0')
  }
})

test('the docs never mention the Pro tier', async ({ page }) => {
  for (const { path } of pages) {
    await page.goto(path)
    await expect(page.locator('main')).not.toContainText(/@inkbar\/pro|\bPro tier\b/)
  }
})
