// Captures the screenshots on the use-case pages from the released packages:
//
//   pnpm screenshots [--desktop | --phone] [slug...]
//
// It serves the capture page with Vite, opens each shot on a desktop screen (1440 by 900 CSS
// pixels, device scale 2) and on a phone (390 pixels wide, device scale 3, touch), sets up that
// shot's state through the toolbar and the viewer's public API, and saves
// src/assets/use-cases/<slug>.png and <slug>-phone.png. Rerun it after upgrading the @inkbar
// packages.
import { fileURLToPath } from 'node:url'

import { chromium, type Page } from '@playwright/test'
import { createServer } from 'vite'

import { setups } from './setups.ts'
import { devices, imageName, shots, shotUrl, type Device } from './shots.ts'

const out = (name: string) =>
  fileURLToPath(new URL(`../../src/assets/use-cases/${name}`, import.meta.url))

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

const args = process.argv.slice(2)
const wanted = args.filter((arg) => !arg.startsWith('--'))
const only = (['desktop', 'phone'] as const).filter((device) =>
  args.includes(`--${device}`)
)
const screens: Device[] = only.length > 0 ? only : ['desktop', 'phone']
// Errors the capture page throws; any of them fails the run once every shot has been tried.
const errors: string[] = []
const server = await createServer({
  configFile: fileURLToPath(new URL('vite.config.ts', import.meta.url)),
})
await server.listen()
const base = `http://localhost:${server.config.server.port}/`
const browser = await chromium.launch()
try {
  for (const device of screens) {
    const context = await browser.newContext({
      ...devices[device],
      colorScheme: 'light',
      // Dates in threads render the same on any machine.
      locale: 'en-GB',
      timezoneId: 'Europe/London',
    })
    for (const shot of shots.filter(
      ({ slug }) => wanted.length === 0 || wanted.includes(slug)
    )) {
      const name = imageName(shot.slug, device)
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`))
      await page.goto(shotUrl(base, shot, device))
      await page.waitForFunction(() => window.viewer?.document.get() != null)
      await waitForDrawn(page)
      await setups[shot.slug](page, device)
      await waitForDrawn(page)
      await page.locator('#viewer').screenshot({ path: out(name) })
      console.log(`Saved ${name}`)
      await page.close()
    }
    await context.close()
  }
} finally {
  await browser.close()
  await server.close()
}
if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
}
