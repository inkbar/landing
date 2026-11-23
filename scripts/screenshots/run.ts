// Captures the screenshots on the use-case pages from the released packages:
//
//   pnpm screenshots [slug...]
//
// It serves the capture page with Vite, opens each shot at 1440 by 900 CSS pixels and device
// scale 2, sets up that shot's state through the toolbar and the viewer's public API, and saves
// src/assets/use-cases/<slug>.png. Rerun it after upgrading the @inkbar packages.
import { fileURLToPath } from 'node:url'

import { chromium, type Page } from '@playwright/test'
import { createServer } from 'vite'

import { setups } from './setups.ts'
import { shots, shotUrl } from './shots.ts'

const out = (slug: string) =>
  fileURLToPath(new URL(`../../src/assets/use-cases/${slug}.png`, import.meta.url))

/** Waits for fonts and for every page in view to have drawn something on its canvas. */
export async function waitForDrawn(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => {
    const canvases = [
      ...document.querySelectorAll<HTMLCanvasElement>('#viewer canvas'),
    ].filter((canvas) => {
      const box = canvas.getBoundingClientRect()
      return box.bottom > 0 && box.top < innerHeight && canvas.width > 0
    })
    if (canvases.length === 0) return false
    return canvases.every((canvas) => {
      const context = canvas.getContext('2d')
      if (!context) return true
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < data.length; i += 4 * 97) if (data[i] < 250) return true
      return false
    })
  })
  await page.waitForTimeout(300)
}

const wanted = process.argv.slice(2)
const server = await createServer({
  configFile: fileURLToPath(new URL('vite.config.ts', import.meta.url)),
})
await server.listen()
const base = `http://localhost:${server.config.server.port}/`
const browser = await chromium.launch()
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    // Dates in threads render the same on any machine.
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  })
  for (const shot of shots.filter(
    ({ slug }) => wanted.length === 0 || wanted.includes(slug)
  )) {
    const page = await context.newPage()
    page.on('pageerror', (error) => console.error(`${shot.slug}: ${error.message}`))
    await page.goto(shotUrl(base, shot))
    await page.waitForFunction(() => window.viewer?.document.get() != null)
    await waitForDrawn(page)
    await setups[shot.slug](page)
    await waitForDrawn(page)
    await page.locator('#viewer').screenshot({ path: out(shot.slug) })
    console.log(`Saved ${shot.slug}.png`)
    await page.close()
  }
} finally {
  await browser.close()
  await server.close()
}
