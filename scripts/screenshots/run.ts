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

/**
 * Waits for fonts, then for every page in view to have drawn something and stopped changing:
 * two samples of its pixels a quarter of a second apart must match. A canvas without a 2D
 * context fails the shot rather than counting as drawn.
 */
async function waitForDrawn(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
  const sample = () =>
    page.evaluate(() => {
      const canvases = [
        ...document.querySelectorAll<HTMLCanvasElement>('#viewer canvas'),
      ].filter((canvas) => {
        const box = canvas.getBoundingClientRect()
        return box.bottom > 0 && box.top < innerHeight && canvas.width > 0
      })
      if (canvases.length === 0) return null
      let sum = 0
      for (const canvas of canvases) {
        const context = canvas.getContext('2d')
        if (!context) throw new Error('A page canvas has no 2D context')
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
        let inked = false
        for (let i = 0; i < data.length; i += 4 * 97) {
          sum = (sum * 31 + data[i]) % 1_000_000_007
          if (data[i] < 250) inked = true
        }
        if (!inked) return null
      }
      return sum
    })
  let previous: number | null = null
  for (let tries = 0; tries < 80; tries++) {
    const current = await sample()
    if (current !== null && current === previous) return
    previous = current
    await page.waitForTimeout(250)
  }
  throw new Error('The pages never finished drawing')
}

const wanted = process.argv.slice(2)
// Errors the capture page throws; any of them fails the run once every shot has been tried.
const errors: string[] = []
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
    page.on('pageerror', (error) => errors.push(`${shot.slug}: ${error.message}`))
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
if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
}
