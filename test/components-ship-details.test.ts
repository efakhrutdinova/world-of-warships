/**
 * The dialog's heading carries flag, tier, class and name in that reading order,
 * and premium hulls are badged here as well as on the card.
 */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShipDetailsDialog from '@/components/ShipDetailsDialog.vue'
import { normalizeCatalog } from '@/api/normalize'
import { useCatalogStore } from '@/stores/catalog'
import { catalogFixture } from './fixtures/catalog'
import type { Ship } from '@/types/ship'

let pinia: ReturnType<typeof createPinia>
let ships: Ship[]

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  const catalog = useCatalogStore()
  catalog.catalog = normalizeCatalog(catalogFixture)
  catalog.origin = 'live'
  ships = catalog.ships

  // happy-dom has no modal behaviour; the dialog element only needs to not throw.
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '')
  })
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open')
  })
})

const shipNamed = (name: string) => ships.find((ship) => ship.name === name)!

function mountDialog(ship: Ship) {
  return mount(ShipDetailsDialog, {
    props: { ship },
    global: { plugins: [pinia] },
  })
}

describe('ShipDetailsDialog', () => {
  it('orders the heading as flag, tier, class, name', () => {
    const html = mountDialog(shipNamed('Preussen')).find('.details__heading').html()

    const order = ['details__flag', 'details__tier', 'details__type', 'details__name'].map((cls) =>
      html.indexOf(cls),
    )
    expect(order.every((position) => position > -1)).toBe(true)
    expect([...order]).toEqual([...order].sort((a, b) => a - b))
  })

  it('colours the tier from the hull variant, as the card does', () => {
    expect(mountDialog(shipNamed('Preussen')).find('.details__tier').classes()).toContain(
      'details__tier--normal',
    )
    expect(mountDialog(shipNamed('AL Tashkent')).find('.details__tier').classes()).toContain(
      'details__tier--premium',
    )
  })

  it('badges a premium hull, and leaves a tech-tree hull unbadged', () => {
    expect(mountDialog(shipNamed('AL Tashkent')).find('.details__badge').text()).toBe('Premium')
    expect(mountDialog(shipNamed('Statenland')).find('.details__badge').text()).toBe('Special')
    expect(mountDialog(shipNamed('Preussen')).find('.details__badge').exists()).toBe(false)
  })

  it('puts a sea plate behind the artwork, which is mostly transparent', () => {
    const wrapper = mountDialog(shipNamed('Preussen'))
    const sky = wrapper.find('.details__sky')

    expect(sky.exists()).toBe(true)
    expect(sky.attributes('src')).toMatch(/sea-sky-day/)
    // Decorative; the ship's own image carries the alt text.
    expect(sky.attributes('alt')).toBe('')
  })

  it('shows a star for a supership rather than a numeral', () => {
    expect(mountDialog(shipNamed('Kunming')).find('.details__tier').text()).toBe('★')
  })
})
