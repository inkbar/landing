import { expect, test } from '@playwright/test'

import { expectNoHorizontalScroll } from './helpers'

test('the landing page is served at the root', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('the docs introduction is served under /docs/', async ({ page }) => {
  const response = await page.goto('/docs/')
  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Introduction' })
  ).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test('body copy is Open Sans and headings are Urbanist', async ({ page }) => {
  await page.goto('/')
  const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  const heading = await page.evaluate(
    () => getComputedStyle(document.querySelector('h1') as Element).fontFamily
  )
  expect(body).toContain('Open Sans')
  expect(heading).toContain('Urbanist')
})

test('no request leaves the site origin', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.hostname !== 'localhost') external.push(request.url())
  })
  await page.goto('/')
  await page.goto('/docs/')
  expect(external).toEqual([])
})
