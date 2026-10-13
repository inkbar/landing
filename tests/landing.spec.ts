import { expect, test } from '@playwright/test'

import {
  expectNoAxeViolations,
  expectNoHorizontalScroll,
  measureFocusRing,
} from './helpers'

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

test('there are no eyebrow labels in the section heading groups', async ({ page }) => {
  const headings = page.locator('main h2')
  expect(await headings.count()).toBeGreaterThan(0)
  for (const heading of await headings.all()) {
    const uppercase = await heading.evaluate((el) => {
      const group = el.parentElement as Element
      return [group, ...group.querySelectorAll('*')]
        .filter((node) => getComputedStyle(node).textTransform === 'uppercase')
        .map((node) => node.className || node.tagName)
    })
    expect(uppercase).toEqual([])
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
  for (const path of paths) {
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

test('every landing link and button is reached by Tab and shows an outline', async ({
  page,
}) => {
  const total = await page.evaluate(() => {
    const targets = document.querySelectorAll('a[href], button')
    targets.forEach((el, index) => el.setAttribute('data-kbd', String(index)))
    return targets.length
  })
  expect(total).toBeGreaterThan(40)
  const reached = new Set<number>()
  const withoutOutline: string[] = []
  // Allow for the tab stops that are not links or buttons: the scrollable code and table regions.
  for (let i = 0; i < total + 20; i += 1) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const el = document.activeElement
      const index = el?.getAttribute('data-kbd')
      if (!el || index === null || index === undefined) return null
      const style = getComputedStyle(el)
      return {
        index: Number(index),
        label: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
        outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2,
      }
    })
    if (stop) {
      reached.add(stop.index)
      if (!stop.outline) withoutOutline.push(stop.label)
    }
  }
  const missing = Array.from({ length: total }, (_, index) => index).filter(
    (index) => !reached.has(index)
  )
  expect(missing, 'links or buttons Tab never reached').toEqual([])
  expect(withoutOutline, 'focused without a visible outline').toEqual([])
})

test.describe('the focus ring contrast', () => {
  const surfaces = [
    { name: 'the paper header', target: 'header a[href="/docs/"]' },
    { name: 'the ink footer', target: 'footer a[href="/#theming"]' },
    { name: 'the ink developers section', target: '#developers button >> nth=0' },
    { name: 'the yellow closing section', target: '#start a[href="/docs/quickstart/"]' },
    { name: 'the ink code samples', target: '#theming pre >> nth=0' },
  ]
  for (const { name, target } of surfaces) {
    test(`is at least 3:1 on ${name}`, async ({ page }) => {
      const result = await measureFocusRing(page, page.locator(target))
      expect(
        result.contrast,
        `${result.ring} on ${result.background}`
      ).toBeGreaterThanOrEqual(3)
    })
  }
})
