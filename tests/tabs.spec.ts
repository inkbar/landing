import { expect, test, type Page } from '@playwright/test'

// The island hydrates when it scrolls into view. Astro removes the `ssr`
// attribute from <astro-island> once hydration has finished.
async function waitForHydration(page: Page) {
  await page.locator('#developers').scrollIntoViewIfNeeded()
  await page.locator('#developers astro-island:not([ssr])').waitFor({ state: 'attached' })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('React is selected first', async ({ page }) => {
  const section = page.locator('#developers')
  await expect(section.getByRole('button', { name: 'React' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await expect(section).toContainText('Review.tsx')
  await expect(section).toContainText("from '@inkbar/react'")
  await expect(section).toContainText('pnpm add @inkbar/react @inkbar/core @inkbar/theme')
})

for (const framework of [
  { name: 'Vue', file: 'Review.vue', pkg: '@inkbar/vue' },
  { name: 'Svelte', file: 'Review.svelte', pkg: '@inkbar/svelte' },
  { name: 'React', file: 'Review.tsx', pkg: '@inkbar/react' },
]) {
  test(`choosing ${framework.name} swaps the code, file name and install command`, async ({
    page,
  }) => {
    const section = page.locator('#developers')
    await waitForHydration(page)
    await section.getByRole('button', { name: framework.name }).click()
    await expect(section.getByRole('button', { name: framework.name })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(section).toContainText(framework.file)
    await expect(section).toContainText(`from '${framework.pkg}'`)
    await expect(section).toContainText(
      `pnpm add ${framework.pkg} @inkbar/core @inkbar/theme`
    )
  })
}

test('the tabs work from the keyboard and show a focus ring', async ({ page }) => {
  const vue = page.locator('#developers').getByRole('button', { name: 'Vue' })
  await waitForHydration(page)
  await vue.focus()
  await page.keyboard.press('Space')
  await expect(vue).toHaveAttribute('aria-pressed', 'true')
  const outline = await vue.evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).not.toBe('none')
})

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false })

  test('the React sample and its install command are still shown', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#developers')
    await expect(section).toContainText('Review.tsx')
    await expect(section).toContainText("from '@inkbar/react'")
    await expect(section).toContainText(
      'pnpm add @inkbar/react @inkbar/core @inkbar/theme'
    )
  })
})
