import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
const fontPath = join(
  dirname(require.resolve('@fontsource-variable/urbanist/package.json')),
  'files/urbanist-latin-wght-normal.woff2'
)
const font = readFileSync(fontPath).toString('base64')
const out = join(dirname(fileURLToPath(import.meta.url)), '../public/og.png')

const html = `<!doctype html>
<html><head><style>
@font-face { font-family: 'Urbanist'; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
body { margin: 0; width: 1200px; height: 630px; background: #F3F4F8; color: #0D1026; font-family: 'Urbanist';
  display: flex; flex-direction: column; justify-content: space-between; padding: 72px; box-sizing: border-box; }
.logo { display: flex; align-items: center; gap: 20px; font-weight: 700; font-size: 64px; letter-spacing: -0.03em; }
h1 { margin: 0; font-weight: 700; font-size: 84px; line-height: 1; letter-spacing: -0.03em; max-width: 980px; }
mark { background: #E4FF4A; color: inherit; padding: 0 0.12em; border-radius: 8px; }
</style></head><body>
<div class="logo">
  <svg viewBox="0 0 32 32" width="72" height="72"><rect width="32" height="32" rx="8" fill="#0D1026"/><circle cx="16" cy="8.2" r="2.4" fill="#FFFFFF"/><rect x="13.8" y="12" width="4.4" height="7.5" fill="#FFFFFF"/><rect x="6" y="21" width="20" height="5" rx="1.5" fill="#E4FF4A"/></svg>
  inkbar
</div>
<h1>A full PDF editor for your web app. <mark>No licence fee.</mark></h1>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: out })
await browser.close()
console.log(`wrote ${out}`)
