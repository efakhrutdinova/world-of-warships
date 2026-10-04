/**
 * Normalization is where every quirk of the vortex payload is absorbed, so these
 * tests run against a fixture sliced from a real response
 */
import { describe, expect, it } from 'vitest'
import {
  hullVariant,
  normalizeCatalog,
  resolveIconUrl,
  resolveShipType,
  typeIconFor,
} from '@/api/normalize'
import { catalogFixture } from './fixtures/catalog'

const catalog = normalizeCatalog(catalogFixture)
const byName = (name: string) => catalog.ships.find((ship) => ship.name === name)

describe('resolveShipType', () => {
  it('reads the type out of the tag list, since there is no type field', () => {
    expect(resolveShipType(['Destroyer', 'special', 'uiPremium'])).toBe('Destroyer')
    expect(resolveShipType(['Submarine', 'sellable'])).toBe('Submarine')
  })

  it('returns null when no tag names a known type', () => {
    expect(resolveShipType(['sellable', 'canRent'])).toBeNull()
  })
})

describe('resolveIconUrl', () => {
  it('joins the media path and the icon path with exactly one slash', () => {
    expect(resolveIconUrl('https://cdn.example/icons/', 'vehicle/small/a.png')).toBe(
      'https://cdn.example/icons/vehicle/small/a.png',
    )
    expect(resolveIconUrl('https://cdn.example/icons', '/vehicle/small/a.png')).toBe(
      'https://cdn.example/icons/vehicle/small/a.png',
    )
  })

  it('returns an empty string for a missing icon, so templates can skip the image', () => {
    expect(resolveIconUrl('https://cdn.example/icons/', undefined)).toBe('')
  })

  it('leaves an absolute URL untouched', () => {
    expect(resolveIconUrl('https://cdn.example/', 'https://other/a.png')).toBe(
      'https://other/a.png',
    )
  })
})

describe('normalizeCatalog', () => {
  it('drops records whose tags name no known type', () => {
    expect(catalog.ships.some((ship) => ship.codename === 'PXXX_NoType')).toBe(false)
    expect(catalog.ships).toHaveLength(Object.keys(catalogFixture.vehicles).length - 1)
  })

  it('uses the localized title as the display name, not the internal codename', () => {
    const ship = byName('AL Tashkent')
    expect(ship).toBeDefined()
    expect(ship?.codename).not.toBe('AL Tashkent')
    expect(ship?.codename).toMatch(/^P/)
  })

  it('maps level to tier and keeps tier 11 superships', () => {
    expect(byName('Kunming')?.tier).toBe(11)
  })

  it('derives premium and special status from the ui tags', () => {
    expect(byName('AL Tashkent')?.isPremium).toBe(true)
    expect(byName('AL Tashkent')?.isSpecial).toBe(false)
    expect(byName('Statenland')?.isSpecial).toBe(true)
  })

  it('flags hulls the in-game catalogue hides', () => {
    expect(byName('Statenland')?.isHidden).toBe(true)
    expect(byName('Preussen')?.isHidden).toBe(false)
  })

  it('builds absolute image URLs from the media path', () => {
    const ship = byName('Preussen')
    expect(ship?.images.medium).toContain(catalogFixture.mediaPath)
    expect(ship?.images.medium).toContain('vehicle/medium/')
  })

  it('leaves large artwork and description empty, since both load lazily', () => {
    const ship = byName('Preussen')
    expect(ship?.images.large).toBe('')
    expect(ship?.description).toBe('')
  })

  it('precomputes a lowercase search string covering name and codename', () => {
    const ship = byName('AL Tashkent')
    expect(ship?.search).toContain('al tashkent')
    expect(ship?.search).toBe(ship?.search.toLowerCase())
  })

  it('sorts by tier, then nation order, then name', () => {
    const tiers = catalog.ships.map((ship) => ship.tier)
    expect([...tiers]).toEqual([...tiers].sort((a, b) => a - b))
  })

  it('converts nation colours and keeps the API order', () => {
    expect(catalog.nations[0].slug).toBe('ussr')
    expect(catalog.nations[0].color).toMatch(/^#[0-9a-f]{6}$/)
    expect(catalog.nations.map((nation) => nation.order)).toEqual(
      catalog.nations.map((_, index) => index),
    )
  })

  it('takes the smallest flag variant, since the flag is drawn at 24x16', () => {
    expect(catalog.nations[0].flag).toContain('nation_flags/tiny/')
  })

  it('orders types by the sort_order the API supplies', () => {
    expect(catalog.types.map((type) => type.id)).toEqual([
      'Submarine',
      'Destroyer',
      'Cruiser',
      'Battleship',
      'AirCarrier',
    ])
  })
})

describe('hullVariant', () => {
  it('names the variant the game would draw, premium winning over special', () => {
    expect(hullVariant(byName('AL Tashkent')!)).toBe('premium')
    expect(hullVariant(byName('Statenland')!)).toBe('special')
    expect(hullVariant(byName('Preussen')!)).toBe('normal')
  })
})

describe('typeIconFor', () => {
  const destroyer = catalog.types.find((type) => type.id === 'Destroyer')!

  it('picks the premium variant for a premium hull', () => {
    const ship = byName('AL Tashkent')!
    expect(typeIconFor(destroyer, ship)).toBe(destroyer.icons.premium)
  })

  it('picks the plain variant for a tech-tree hull', () => {
    const ship = byName('Kunming')!
    expect(typeIconFor(destroyer, ship)).toBe(destroyer.icons.normal)
  })
})
