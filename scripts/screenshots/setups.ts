// How each shot reaches the state its page shows, through the toolbar and the viewer's public
// API, as a person or a host app would.
import type { Shot } from './shots.ts'
import type { Page } from '@playwright/test'

export const setups: Record<Shot['slug'], (page: Page) => Promise<void>> = {
  'redact-pdfs': async (page) => {
    // Two text marks from search hits, as a host would make them, and one area mark.
    await page.evaluate(async () => {
      const doc = window.viewer.document.get()!
      const [ni] = await doc.search('QQ123456C').all()
      const [email] = await doc.search('m.okafor@example.com').all()
      const [address] = await doc.search('41 Quillon Row, Marlowby ZZ1 1ZZ').all()
      if (!ni || !email || !address) throw new Error('The customer records moved')
      for (const hit of [ni, email]) {
        doc.annotations.add({ type: 'redact', page: hit.page, quads: hit.quads })
      }
      doc.annotations.add({ type: 'redact', page: address.page, rect: address.rect })
    })
    await page.getByRole('button', { name: 'Apply redactions' }).click()
    await page.getByRole('dialog').getByText('3 marks on 1 page').waitFor()
  },
  'fill-pdf-forms': async (page) => {
    // Typed and ticked as a person would, into the fields Inkbar renders over the page. The
    // fields are found by their names in the form; the last one keeps the focus.
    const viewer = page.locator('#viewer')
    await viewer.getByLabel('name', { exact: true }).fill('Alex Sample')
    await viewer.getByLabel('Email', { exact: true }).fill('alex@example.com')
    await viewer.getByLabel('agree', { exact: true }).click()
    await viewer
      .getByLabel('notes', { exact: true })
      .fill('Joining for the spring season.')
  },
  'sign-pdfs': async (page) => {
    // Draw a signature on the real signature pad, then place it between the sign-off and the
    // sender's printed name, as she would sign her own letter.
    await page.getByRole('button', { name: 'Choose signature' }).click()
    await page.getByRole('menuitem', { name: 'Create signature' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create signature' })
    await dialog.getByRole('tab', { name: 'Draw' }).click()
    const pad = await dialog.getByLabel('Signature pad').boundingBox()
    if (!pad) throw new Error('No signature pad')
    await drawSignature(page, pad)
    await dialog.getByRole('button', { name: 'Save' }).click()
    await dialog.waitFor({ state: 'hidden' })

    const viewer = page.locator('#viewer')
    await page.mouse.move(720, 500)
    await page.mouse.wheel(0, 420)
    await page.waitForTimeout(400)
    const signOff = await viewer.getByText('Yours sincerely,').boundingBox()
    const name = await viewer.getByText('Priya Shah').boundingBox()
    if (!signOff || !name) throw new Error('The letter has no sign-off')
    const sign = page.getByRole('button', { name: 'Sign', exact: true })
    if ((await sign.getAttribute('aria-pressed')) !== 'true') await sign.click()
    await page.mouse.click(name.x + 90, (signOff.y + signOff.height + name.y) / 2)
    await page.locator('#viewer .ink-annotation').first().waitFor()
  },
  'review-pdfs': async (page) => {
    // Two highlights from search hits, one carrying a comment and then a reply from someone
    // else, as a host would load them from its own store. The clock is set before each, so the
    // thread shows the same times on every run. Then open that thread as a reviewer would.
    await page.clock.setFixedTime(new Date('2026-11-18T09:12:00Z'))
    const commented = await page.evaluate(async () => {
      const doc = window.viewer.document.get()!
      const [first] = await doc.search('Read the brief, find the site on the map').all()
      const [second] = await doc.search('Agree the roles before you arrive').all()
      if (!first || !second) throw new Error('The handbook text moved')
      window.viewer.viewport.get()?.scrollToPage(first.page)
      doc.annotations.add({ type: 'highlight', page: first.page, quads: first.quads })
      const comment = doc.annotations.add({
        type: 'highlight',
        page: second.page,
        quads: second.quads,
        author: 'Sam Rivera',
        contents: 'Can we say who decides if the roles change on site?',
      })
      return { id: comment.id, page: second.page, rect: second.rect }
    })
    await page.clock.setFixedTime(new Date('2026-11-18T10:40:00Z'))
    await page.evaluate((comment) => {
      window.viewer.document.get()!.annotations.add({
        type: 'text',
        page: comment.page,
        rect: comment.rect,
        inReplyTo: comment.id,
        author: 'Alex Sample',
        contents:
          'Good point. The person running the instrument decides. I will add a line.',
      })
    }, commented)
    await page.waitForTimeout(400)
    await page
      .getByRole('button', { name: 'Highlight with comment by Sam Rivera' })
      .click()
    await page.getByText('The person running the instrument decides.').waitFor()
  },
}

/** A short flowing signature, drawn as two pen strokes the way a person would sign. */
async function drawSignature(
  page: Page,
  pad: { x: number; y: number; width: number; height: number }
): Promise<void> {
  const left = pad.x + pad.width * 0.12
  const mid = pad.y + pad.height * 0.55
  const span = pad.width * 0.7
  const stroke = async (points: [number, number][]) => {
    await page.mouse.move(left + points[0][0] * span, mid + points[0][1] * pad.height)
    await page.mouse.down()
    for (const [x, y] of points.slice(1)) {
      await page.mouse.move(left + x * span, mid + y * pad.height, { steps: 4 })
    }
    await page.mouse.up()
  }
  // A looped capital P, a run of joined cursive loops that shrink as the hand speeds up, and
  // an underline flourish.
  const capital: [number, number][] = [
    [0.03, 0.14],
    [0.05, 0.0],
    [0.07, -0.2],
  ]
  for (let t = 0; t <= 1; t += 0.05) {
    const a = Math.PI * (1.5 * t - 0.5)
    capital.push([0.08 + 0.08 * Math.cos(a), -0.13 + 0.08 * Math.sin(a)])
  }
  const run: [number, number][] = []
  for (let t = 0; t <= 1; t += 0.008) {
    const turn = 2 * Math.PI * 7 * t
    const height = 0.11 * (1 - 0.55 * t)
    run.push([
      0.2 + 0.72 * t - 0.022 * Math.sin(turn),
      0.07 - (height * (1 - Math.cos(turn))) / 2 - 0.03 * t,
    ])
  }
  const flourish: [number, number][] = []
  for (let t = 0; t <= 1; t += 0.05)
    flourish.push([0.12 + 0.86 * t, 0.16 - 0.05 * t + 0.02 * Math.sin(t * Math.PI)])
  await stroke(capital)
  await stroke(run)
  await stroke(flourish)
}
