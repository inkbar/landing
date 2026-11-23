import { readdirSync, readFileSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers'

// Every page in the collection, with the frontmatter the tests check against.
const dir = new URL('../src/content/use-cases/', import.meta.url)
const pages = readdirSync(dir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const text = readFileSync(new URL(name, dir), 'utf8')
    const field = (key: string) =>
      new RegExp(`^${key}: ?'?([^'\\n]+)'?$`, 'm').exec(text)?.[1]
    return {
      slug: name.slice(0, -'.md'.length),
      guide: field('guide') ?? '',
      order: Number(field('order')),
    }
  })
  .sort((a, b) => a.order - b.order)

test('there is at least one use-case page', () => {
  expect(pages.length).toBeGreaterThan(0)
})

for (const { slug, guide } of pages) {
  test(`/use-cases/${slug}/ leads with the outcome and a sized screenshot`, async ({
    page,
    request,
  }) => {
    expect((await page.goto(`/use-cases/${slug}/`))?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    const shot = page.locator('main img').first()
    await expect(shot).toHaveAttribute('alt', /\S/)
    await expect(shot).toHaveAttribute('width', /^\d+$/)
    await expect(shot).toHaveAttribute('height', /^\d+$/)
    const link = page.locator('main').getByRole('link', { name: /^Read the .+ guide$/ })
    await expect(link).toHaveAttribute('href', new RegExp(`/docs/guides/${guide}/$`))
    expect((await request.get(`/docs/guides/${guide}/`)).status()).toBe(200)
  })

  test(`/use-cases/${slug}/ fits the screen and has no accessibility violations`, async ({
    page,
  }) => {
    await page.goto(`/use-cases/${slug}/`)
    await expectNoHorizontalScroll(page)
    await expectNoAxeViolations(page)
  })
}

test('the footer lists the use-case pages in order', async ({ page }) => {
  await page.goto('/')
  // The page links, not the column heading's link to the overview.
  const links = page.locator('nav[aria-label="Use cases"] > a')
  const hrefs = await links.evaluateAll((all) =>
    all.map((link) => link.getAttribute('href'))
  )
  expect(hrefs.map((href) => href?.replace(/^.*\/use-cases\//, ''))).toEqual(
    pages.map(({ slug }) => `${slug}/`)
  )
})

test('the overview lists every use-case page in order and the footer links to it', async ({
  page,
}) => {
  expect((await page.goto('/use-cases/'))?.status()).toBe(200)
  await expect(page.locator('h1')).toHaveCount(1)
  const hrefs = await page
    .locator('main ul a')
    .evaluateAll((all) => all.map((link) => link.getAttribute('href')))
  expect(hrefs.map((href) => href?.replace(/^.*\/use-cases\//, ''))).toEqual(
    pages.map(({ slug }) => `${slug}/`)
  )
  await expectNoHorizontalScroll(page)
  await expectNoAxeViolations(page)
  await page.goto('/')
  await expect(
    page
      .getByRole('navigation', { name: 'Use cases' })
      .getByRole('link', { name: 'Use cases' })
  ).toHaveAttribute('href', /\/use-cases\/$/)
})

test('each use-case heading carries its mark', async ({ page }) => {
  for (const { slug } of pages) {
    await page.goto(`/use-cases/${slug}/`)
    await expect(page.locator('h1 .mark')).toHaveCount(1)
  }
})
