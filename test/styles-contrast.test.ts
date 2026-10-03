/**
 * Guards the palette's contrast.
 *
 * The colour scheme is a steel blue-grey built around #51809e, which means
 * surfaces are mid-tone rather than near-black and text contrast is no longer
 * automatic. These pairs are the ones that actually occur in the interface; the
 * test reads them from `tokens.css`, so adjusting a colour there cannot quietly
 * push small text below WCAG AA.
 */
import { describe, expect, it } from 'vitest'
// Read as text, so the test checks the same stylesheet the app ships. `tokens.css`
// is opted into CSS processing in `vitest.config.ts` for exactly this reason.
import css from '@/styles/tokens.css?raw'

function token(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) throw new Error(`token --${name} not found in tokens.css`)
  return match[1]
}

function channels(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ]
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((channel) => {
    const srgb = channel / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}

/** Mirrors `color-mix(in srgb, fg <pct>%, bg)` closely enough for a contrast check. */
function mix(foreground: string, background: string, share: number): string {
  const f = channels(foreground)
  const b = channels(background)
  return `#${f
    .map((channel, index) => Math.round(share * channel + (1 - share) * b[index]))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

const AA_SMALL_TEXT = 4.5
const NON_TEXT = 3

describe('palette contrast', () => {
  const surfaces = ['surface-sunken', 'surface-base', 'surface-raised', 'surface-overlay']
  const bodyText = ['text-primary', 'text-secondary', 'text-muted']

  it.each(surfaces.flatMap((surface) => bodyText.map((text) => [text, surface] as const)))(
    '%s on %s meets AA for small text',
    (text, surface) => {
      expect(contrast(token(text), token(surface))).toBeGreaterThanOrEqual(AA_SMALL_TEXT)
    },
  )

  it('interactive text is readable on the surfaces it appears on', () => {
    for (const surface of ['surface-base', 'surface-raised']) {
      expect(contrast(token('accent-steel-bright'), token(surface))).toBeGreaterThanOrEqual(
        AA_SMALL_TEXT,
      )
    }
  })

  it('keeps the gold tier numeral and badges readable on cards', () => {
    expect(contrast(token('hull-mark-premium'), token('surface-sunken'))).toBeGreaterThanOrEqual(
      AA_SMALL_TEXT,
    )
  })

  it('keeps a selected filter tile label readable over its steel fill', () => {
    const fill = mix(token('accent-steel'), token('surface-raised'), 0.22)
    expect(contrast(token('accent-gold'), fill)).toBeGreaterThanOrEqual(AA_SMALL_TEXT)
  })

  it('gives the focus ring enough contrast against the page', () => {
    expect(contrast(token('accent-steel-bright'), token('surface-base'))).toBeGreaterThanOrEqual(
      NON_TEXT,
    )
  })

  it('keeps every surface in one hue family, so the scheme reads as one palette', () => {
    const hues = surfaces.map((name) => {
      const [r, g, b] = channels(token(name)).map((channel) => channel / 255)
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const delta = max - min
      if (delta === 0) return 0
      if (max === r) return (60 * (((g - b) / delta) % 6) + 360) % 360
      if (max === g) return 60 * ((b - r) / delta + 2)
      return 60 * ((r - g) / delta + 4)
    })
    for (const hue of hues) {
      // #51809e sits at 203 degrees; the surfaces stay within a few degrees of it.
      expect(hue).toBeGreaterThan(198)
      expect(hue).toBeLessThan(212)
    }
  })
})
