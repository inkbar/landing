import { readdirSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers'

const docsPaths = [
  '/docs/',
  '/docs/quickstart/',
  '/docs/loading-assets/',
  '/docs/guides/annotations/',
  '/docs/guides/controlled-mode/',
  '/docs/guides/search/',
  '/docs/guides/drawing/',
  '/docs/guides/forms/',
  '/docs/guides/signatures/',
  '/docs/guides/theming/',
  '/docs/frameworks/vue/',
  '/docs/frameworks/react/',
  '/docs/frameworks/plain-dom/',
  '/docs/reference/theme-tokens/',
]

test('the landing page fits 320px wide', async ({ page }) => {
  await page.goto('/')
  await expectNoHorizontalScroll(page)
  await expectNoAxeViolations(page)
})

for (const path of docsPaths) {
  test(`${path} fits 320px wide with nothing over the header links`, async ({ page }) => {
    await page.goto(path)
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)
    const covered = await page.evaluate(() => {
      const links = document.querySelectorAll('nav[aria-label="Site"] a')
      const header = document.querySelector('header')?.getBoundingClientRect()
      return Array.from(links)
        .filter((link) => {
          const box = link.getBoundingClientRect()
          const top = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2
          )
          const outside = header ? box.bottom > header.bottom + 0.5 : true
          return !(top && link.contains(top)) || outside
        })
        .map((link) => link.textContent?.trim())
    })
    expect(covered, 'header links covered or outside the header').toEqual([])
  })
}

// Every use-case page, from its Markdown file: a long heading must still fit a small phone.
const useCasePaths = readdirSync(new URL('../src/content/use-cases/', import.meta.url))
  .filter((name) => name.endsWith('.md'))
  .map((name) => `/use-cases/${name.slice(0, -'.md'.length)}/`)
  .concat('/use-cases/')

for (const path of useCasePaths) {
  test(`${path} fits 320px wide`, async ({ page }) => {
    await page.goto(path)
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)
  })
}
