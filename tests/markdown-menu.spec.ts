import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
})

test('Copy as Markdown puts the page Markdown on the clipboard', async ({ page }) => {
  await page.goto('/docs/guides/search/')
  const copy = page.getByRole('button', { name: 'Copy as Markdown' })
  await copy.click()
  await expect(page.locator('[data-markdown-menu] [aria-live]')).toHaveText('Copied')
  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toMatch(/^# Search\n\n> For AI agents:/)
})

test('the Markdown menu opens from the keyboard and copies the llms.txt link', async ({
  page,
}) => {
  await page.goto('/docs/quickstart/')
  const arrow = page.getByRole('button', { name: 'More Markdown options' })
  await arrow.focus()
  await page.keyboard.press('Enter')
  await expect(arrow).toHaveAttribute('aria-expanded', 'true')

  const view = page.getByRole('menuitem', { name: /View Markdown/ })
  await expect(view).toBeFocused()
  await expect(view).toHaveAttribute('href', 'https://inkbar.dev/docs/quickstart.md')

  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitem', { name: /Copy llms\.txt link/ })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(arrow).toBeFocused()
  await expect(page.locator('[data-markdown-menu] [aria-live]')).toHaveText('Link copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://inkbar.dev/llms.txt'
  )

  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(arrow).toBeFocused()
})

test('without JavaScript the docs title offers a plain Markdown link', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/docs/')
  await expect(page.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
    'href',
    'https://inkbar.dev/docs.md'
  )
  await context.close()
})
