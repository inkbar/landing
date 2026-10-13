import { AxeBuilder } from '@axe-core/playwright'
import { expect, type Locator, type Page } from '@playwright/test'

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow, 'page scrolls sideways').toBeLessThanOrEqual(0)
}

export async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}

export interface FocusRing {
  ring: string
  background: string
  contrast: number
}

/**
 * Focuses an element with the keyboard, then measures its focus ring against the first opaque
 * background behind it. The result is a WCAG contrast ratio.
 */
export async function measureFocusRing(page: Page, target: Locator): Promise<FocusRing> {
  // A key press first makes the browser treat the next focus as keyboard focus.
  await page.keyboard.press('Shift')
  await target.focus()
  return target.evaluate((el) => {
    const parse = (value: string): number[] => (value.match(/[\d.]+/g) ?? []).map(Number)
    const channel = (v: number): number => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    const luminance = ([r = 0, g = 0, b = 0]: number[]): number =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    const style = getComputedStyle(el)
    // The ring sits outside the element unless the offset is negative, so measure the
    // surface behind the ring, which is the element's parent surface or its own background.
    const insideRing = parseFloat(style.outlineOffset) < 0
    let node: Element | null = insideRing ? el : el.parentElement
    let background = 'rgb(255, 255, 255)'
    while (node) {
      const colour = getComputedStyle(node).backgroundColor
      const alpha = parse(colour)[3]
      if (colour !== 'rgba(0, 0, 0, 0)' && (alpha === undefined || alpha > 0)) {
        background = colour
        break
      }
      node = node.parentElement
    }
    const a = luminance(parse(style.outlineColor))
    const b = luminance(parse(background))
    return {
      ring: style.outlineColor,
      background,
      contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    }
  })
}
