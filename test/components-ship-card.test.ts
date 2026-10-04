/**
 * The card is now only artwork: nation, class and tier are conveyed by images.
 * These tests pin the two things that are easy to lose in that design — the
 * accessible text, and which flag variant is used where.
 */
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ShipCard from '@/components/ShipCard.vue'
import { normalizeCatalog } from '@/api/normalize'
import { catalogFixture } from './fixtures/catalog'
import { clearArtCache } from '@/utils/art-cache'
import type { Ship } from '@/types/ship'

const catalog = normalizeCatalog(catalogFixture)
const shipNamed = (name: string) => catalog.ships.find((ship) => ship.name === name)!

function mountCard(ship: Ship, artEnabled = true) {
  return mount(ShipCard, {
    props: {
      ship,
      nation: catalog.nations.find((nation) => nation.slug === ship.nation),
      type: catalog.types.find((type) => type.id === ship.type),
      artEnabled,
    },
  })
}

describe('ShipCard', () => {
  // The art cache outlives a component on purpose, so it has to be reset here or
  // one case would inherit another's loaded artwork.
  beforeEach(clearArtCache)

  it('uses the nation flag as the backdrop behind the artwork', () => {
    const wrapper = mountCard(shipNamed('Preussen'))
    const flag = wrapper.find('.card__flag')

    expect(flag.attributes('src')).toContain('nation_flags/small/')
    // Decorative: the nation is already in the accessible description.
    expect(flag.attributes('alt')).toBe('')
  })

  it('places the class icon and the tier together, class first', () => {
    const wrapper = mountCard(shipNamed('Preussen'))
    const chip = wrapper.find('.card__class')

    expect(chip.find('img.card__type').exists()).toBe(true)
    expect(chip.find('.card__tier').text()).toBe('X')
    expect(chip.html().indexOf('card__type')).toBeLessThan(chip.html().indexOf('card__tier'))
  })

  it('colours the tier from the same hull variant as the class icon', () => {
    // Regression: the icon followed the variant while the numeral was hardcoded
    // gold, so a tech-tree ship showed a white icon beside a gold tier.
    const techTree = mountCard(shipNamed('Preussen')).find('.card__tier')
    expect(techTree.classes()).toContain('card__tier--normal')
    expect(techTree.classes()).not.toContain('card__tier--premium')

    const premium = mountCard(shipNamed('AL Tashkent')).find('.card__tier')
    expect(premium.classes()).toContain('card__tier--premium')

    const special = mountCard(shipNamed('Statenland')).find('.card__tier')
    expect(special.classes()).toContain('card__tier--special')
  })

  it('marks a tier 11 ship with a star, as the game does', () => {
    expect(mountCard(shipNamed('Kunming')).find('.card__tier').text()).toBe('★')
  })

  it('carries no text rows beyond the name', () => {
    const wrapper = mountCard(shipNamed('Preussen'))
    expect(wrapper.find('.card__name').text()).toBe('Preussen')
    expect(wrapper.find('.card__meta').exists()).toBe(false)
    expect(wrapper.find('.card__info').exists()).toBe(false)
  })

  it('repeats nation, class and tier as hidden text, since they are pictures', () => {
    const description = mountCard(shipNamed('Preussen')).find('.visually-hidden').text()

    expect(description).toContain('Preussen')
    expect(description).toContain('Battleship')
    expect(description).toContain('Germany')
    expect(description).toContain('tier X')
  })

  it('says "supership" rather than a tier for tier 11', () => {
    expect(mountCard(shipNamed('Kunming')).find('.visually-hidden').text()).toContain('supership')
  })

  it('offers both artwork sizes and describes the card width mobile-first', () => {
    const art = mountCard(shipNamed('Preussen')).find('.card__ship')

    expect(art.attributes('srcset')).toMatch(/vehicle\/small\/.+ 214w/)
    expect(art.attributes('srcset')).toMatch(/vehicle\/medium\/.+ 435w/)

    const sizes = art.attributes('sizes')!
    // Narrowest case is the unconditioned default, every condition is `min-width`.
    expect(sizes.endsWith('calc(100vw - 32px)')).toBe(true)
    expect(sizes).not.toContain('max-width')
    // Widest band first: `sizes` is first-match-wins, not last.
    const widths = [...sizes.matchAll(/min-width:\s*(\d+)px/g)].map((m) => Number(m[1]))
    expect(widths).toEqual([...widths].sort((a, b) => b - a))
  })

  it('hides the artwork until it loads, leaving the flag as the placeholder', async () => {
    const wrapper = mountCard(shipNamed('Preussen'))
    const art = wrapper.find('.card__ship')

    expect(art.classes()).not.toContain('card__ship--loaded')

    await art.trigger('load')
    expect(wrapper.find('.card__ship').classes()).toContain('card__ship--loaded')
  })

  it('reveals the artwork even if it fails, so a card cannot stay blank', async () => {
    const wrapper = mountCard(shipNamed('Preussen'))

    await wrapper.find('.card__ship').trigger('error')
    expect(wrapper.find('.card__ship').classes()).toContain('card__ship--loaded')
  })

  it('requests no artwork while the page is scrolling', () => {
    const wrapper = mountCard(shipNamed('Preussen'), false)

    expect(wrapper.find('.card__ship').exists()).toBe(false)
    // The flag still carries the card, so it is not a blank rectangle.
    expect(wrapper.find('.card__flag').exists()).toBe(true)
  })

  it('keeps artwork it already loaded when scrolling resumes', async () => {
    const wrapper = mountCard(shipNamed('Preussen'))
    await wrapper.find('.card__ship').trigger('load')

    await wrapper.setProps({ artEnabled: false })
    expect(wrapper.find('.card__ship').exists()).toBe(true)
  })

  it('shows remembered artwork at once, so scrolling back does not reload it', async () => {
    const ship = shipNamed('Preussen')

    const first = mountCard(ship)
    await first.find('.card__ship').trigger('load')
    first.unmount()

    // A fresh instance, as the virtualizer would create after the row returns —
    // and mid-scroll, when a first-time card would show nothing.
    const second = mountCard(ship, false)
    const art = second.find('.card__ship')

    expect(art.exists()).toBe(true)
    // Already marked loaded on the first render, so no fade-in replays.
    expect(art.classes()).toContain('card__ship--loaded')
  })

  it('badges premium and special hulls, and nothing else', () => {
    expect(mountCard(shipNamed('AL Tashkent')).find('.card__badge').text()).toBe('Premium')
    expect(mountCard(shipNamed('Statenland')).find('.card__badge').text()).toBe('Special')
    expect(mountCard(shipNamed('Preussen')).find('.card__badge').exists()).toBe(false)
  })
})
