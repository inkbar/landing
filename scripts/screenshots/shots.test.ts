import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'

import { devices, imageName, shots, shotUrl } from './shots.ts'

test('there is one shot per use-case page', () => {
  assert.deepEqual(
    shots.map(({ slug }) => slug),
    ['redact-pdfs', 'fill-pdf-forms', 'sign-pdfs', 'review-pdfs']
  )
})

test('every shot names a sample document that exists', () => {
  for (const { document } of shots) {
    assert.ok(existsSync(new URL(`documents/${document}`, import.meta.url)), document)
  }
})

test('the redaction shot loads the engine and the area tool, and the signing shot the signature tool', () => {
  const redact = shots.find(({ slug }) => slug === 'redact-pdfs')
  assert.equal(redact?.engine, true)
  assert.ok(redact?.tools.includes('redact-area'))
  assert.ok(shots.find(({ slug }) => slug === 'sign-pdfs')?.tools.includes('signature'))
})

test('shotUrl names the shot in the query', () => {
  assert.equal(
    shotUrl('http://localhost:5199/', shots[0]),
    'http://localhost:5199/?shot=redact-pdfs'
  )
})

test('a phone shot asks the capture page for the phone layout and saves beside the desktop one', () => {
  assert.equal(
    shotUrl('http://localhost:5199/', shots[0], 'phone'),
    'http://localhost:5199/?shot=redact-pdfs&device=phone'
  )
  assert.equal(imageName('sign-pdfs', 'desktop'), 'sign-pdfs.png')
  assert.equal(imageName('sign-pdfs', 'phone'), 'sign-pdfs-phone.png')
})

test('the phone is a touch screen 390 CSS pixels wide at device scale 3', () => {
  assert.deepEqual(devices.phone, {
    viewport: { width: 390, height: 728 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  })
  assert.deepEqual(devices.desktop, {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  })
})
