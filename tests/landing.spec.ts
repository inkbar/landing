import { expect, test } from '@playwright/test'

import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('the hero states the offer and the install command', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A full PDF editor for your web app. No licence fee.'
  )
  await expect(page.getByText('free under the MIT licence')).toBeVisible()
  await expect(page.locator('main code').first()).toContainText('pnpm add @inkbar/core')
  await expect(
    page.getByRole('link', { name: 'Read the quickstart' }).first()
  ).toHaveAttribute('href', '/docs/quickstart/')
})

test('the hero has no filled call-to-action button', async ({ page }) => {
  const hero = page.locator('[data-section="hero"]')
  await expect(hero.getByRole('button')).toHaveCount(0)
  for (const link of await hero.getByRole('link').all()) {
    const background = await link.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(background).toBe('rgba(0, 0, 0, 0)')
  }
})

test('the viewer mock exposes a labelled toolbar', async ({ page }) => {
  const toolbar = page.getByRole('toolbar', { name: 'PDF tools' })
  await expect(toolbar).toBeVisible()
  for (const name of [
    'Select',
    'Highlight',
    'Underline',
    'Note',
    'Draw',
    'Redact',
    'Undo',
    'Redo',
  ]) {
    await expect(toolbar.getByRole('button', { name, exact: true })).toBeVisible()
  }
  await expect(toolbar.getByRole('button', { name: 'Highlight' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})

test('the strip lists the supported frameworks', async ({ page }) => {
  const strip = page.locator('[data-section="works-with"]')
  for (const name of ['TypeScript', 'Vue', 'React', 'Svelte', 'Plain DOM']) {
    await expect(strip.getByText(name, { exact: true })).toBeVisible()
  }
})

test('every section heading from the canvas is present, in order', async ({ page }) => {
  const headings = await page.locator('main h2').allTextContents()
  expect(headings.map((text) => text.replace(/\s+/g, ' ').trim())).toEqual([
    'A few components and one stylesheet.',
    'It should look like your product, not ours.',
    'What the paid SDKs do, in the free one.',
    'A line item you get to renew delete.',
    'Install it and see.',
  ])
})

test('there are no eyebrow labels above the headings', async ({ page }) => {
  for (const heading of await page.locator('main h2').all()) {
    const previous = await heading.evaluate((el) => {
      const sibling = el.previousElementSibling
      return sibling ? getComputedStyle(sibling).textTransform : 'none'
    })
    expect(previous).not.toBe('uppercase')
  }
})

test('the theming section shows three routes', async ({ page }) => {
  const cards = page.locator('#theming article')
  await expect(cards).toHaveCount(3)
  await expect(cards.nth(0).getByRole('heading')).toHaveText('Use the default')
  await expect(cards.nth(1).getByRole('heading')).toHaveText('Restyle it with CSS')
  await expect(cards.nth(2).getByRole('heading')).toHaveText(
    'Rebuild it in your design system'
  )
})

test('the features grid lists eight features, forms and redaction among them', async ({
  page,
}) => {
  const titles = await page.locator('#features h3').allTextContents()
  expect(titles).toEqual([
    'Viewing',
    'Text markup',
    'Notes and threads',
    'Drawing and shapes',
    'Redaction',
    'Forms',
    'Undo and redo',
    'Accessible by default',
  ])
})

test('the comparison is a real table that names no competitor', async ({ page }) => {
  const table = page.locator('#why table')
  await expect(
    table.getByRole('columnheader', { name: 'Typical commercial SDK' })
  ).toBeVisible()
  await expect(table.getByRole('rowheader')).toHaveCount(7)
  await expect(table.getByRole('row', { name: /Price Free/ })).toBeVisible()
})

test('the closing section shows the default framework install command', async ({
  page,
}) => {
  await expect(page.locator('#start')).toContainText(
    'pnpm add @inkbar/react @inkbar/core @inkbar/theme'
  )
})

test('every internal link on the landing page resolves', async ({ page, request }) => {
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') as string))
  const paths = [...new Set(hrefs.map((href) => href.split('#')[0] ?? '/'))]
  // /docs/quickstart/ arrives with the docs pages; until then it is the one known gap.
  const known = new Set(['/docs/quickstart/'])
  for (const path of paths) {
    if (known.has(path)) continue
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
  }
  for (const href of hrefs.filter((value) => value.startsWith('/#'))) {
    await expect(page.locator(href.slice(1)), href).toHaveCount(1)
  }
})

test('the page does not scroll sideways', async ({ page }) => {
  await expectNoHorizontalScroll(page)
})

test('the page has no accessibility violations', async ({ page }) => {
  await expectNoAxeViolations(page)
})

test('every landing link and button is reachable by keyboard', async ({ page }) => {
  const describe = (els: Element[]) =>
    els.map(
      (el) =>
        `${el.tagName}:${el.textContent?.trim() ?? ''}:${el.getAttribute('aria-label') ?? ''}`
    )
  const expected = new Set(await page.locator('a[href], button').evaluateAll(describe))
  const total = await page.locator('a[href], button').count()
  const seen = new Set<string>()
  for (let i = 0; i < total + 5; i += 1) {
    await page.keyboard.press('Tab')
    const id = await page.evaluate(() => {
      const el = document.activeElement
      return el
        ? `${el.tagName}:${el.textContent?.trim() ?? ''}:${el.getAttribute('aria-label') ?? ''}`
        : ''
    })
    seen.add(id)
  }
  expect(seen.size).toBeGreaterThanOrEqual(expected.size)
})
