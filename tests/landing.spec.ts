import { expect, test } from '@playwright/test'

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
