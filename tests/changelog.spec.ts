import { readdirSync } from 'node:fs'

import { expect, test } from '@playwright/test'

import { newestFirst, releaseUrl } from '../src/lib/changelog'

import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers'

// The page exists only once the changelog has notes, so each test runs in one state or the
// other. The backfill pull request is where the full set first runs.
const versions = readdirSync(new URL('../src/content/changelog/', import.meta.url))
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -'.md'.length))
const hasNotes = versions.length > 0

test('with no notes there is no changelog page or footer link', async ({
  page,
  request,
}) => {
  test.skip(hasNotes, 'the changelog has notes')
  expect((await request.get('/changelog/')).status()).toBe(404)
  await page.goto('/')
  await expect(
    page.locator('footer').getByRole('link', { name: 'Changelog' })
  ).toHaveCount(0)
  const sitemap = await (await request.get('/sitemap-0.xml')).text()
  expect(sitemap).not.toContain('/changelog/')
})

test('the changelog lists releases newest first', async ({ page }) => {
  test.skip(!hasNotes, 'the changelog has no notes yet')
  await page.goto('/changelog/')
  await expect(page.locator('h1')).toHaveCount(1)
  const ids = await page
    .locator('section[id^="v"]')
    .evaluateAll((sections) => sections.map((section) => section.id))
  const expected = newestFirst(versions.map((version) => ({ data: { version } })))
  expect(ids).toEqual(expected.map(({ data }) => `v${data.version.replaceAll('.', '-')}`))
  for (const { data } of expected) {
    const section = page.locator(`#v${data.version.replaceAll('.', '-')}`)
    await expect(section.locator('h2')).toHaveText(data.version)
    await expect(section.getByRole('link').last()).toHaveAttribute(
      'href',
      releaseUrl(data.version)
    )
  }
  await expect(
    page.locator('footer').getByRole('link', { name: 'Changelog' })
  ).toHaveAttribute('href', /\/changelog\/$/)
})

test('the changelog fits a phone and has no accessibility violations', async ({
  page,
}) => {
  test.skip(!hasNotes, 'the changelog has no notes yet')
  expect((await page.goto('/changelog/'))?.status()).toBe(200)
  await expectNoHorizontalScroll(page)
  await expectNoAxeViolations(page)
})
