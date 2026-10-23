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
  await expect(page.locator('main code').first()).toContainText(
    'pnpm add @inkbar/react @inkbar/core @inkbar/theme'
  )
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
    'View',
    'Select',
    'Highlight',
    'Mark for redaction',
    'Add note',
    'Undo',
    'Redo',
    'Previous page',
    'Next page',
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
    'What it does today.',
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
  await expect(cards.nth(2).getByRole('heading')).toHaveText('Use your own components')
})

test('the features grid lists what ships, then what is on the way', async ({ page }) => {
  const titles = await page.locator('#features .cell h3').allTextContents()
  expect(titles.map((text) => text.trim())).toEqual([
    'Viewing',
    'Search',
    'Forms',
    'Signatures',
    'Highlights',
    'Note threads',
    'Redaction marks',
    'Drawing',
    'Annotations as data',
    'Undo and redo',
    'Keyboard and screen readers',
  ])
  await expect(page.locator('#features .next li')).toHaveCount(1)
})

for (const [width, columns] of [
  [1280, 3],
  [960, 3],
  [800, 2],
  [600, 2],
  [500, 1],
  [375, 1],
] as const) {
  test(`the feature grid has ${columns} equal columns at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const cells = await page.locator('#features .cell').evaluateAll((els) =>
      els.map((el) => {
        const { left, width } = el.getBoundingClientRect()
        return { left: Math.round(left), width: Math.round(width) }
      })
    )
    // No cell stretches across a short last row: every cell has the first one's width.
    for (const cell of cells)
      expect(Math.abs(cell.width - cells[0].width)).toBeLessThanOrEqual(1)
    expect(new Set(cells.map((cell) => cell.left)).size).toBe(columns)
  })
}

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
