/**
 * The grid answers the assignment's performance requirement, so the behaviour is
 * asserted rather than assumed: the whole result is represented, while only a
 * window of it exists in the document.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ShipGrid from '@/components/ShipGrid.vue'
import type { Nation, Ship, ShipType, ShipTypeId } from '@/types/ship'

const CONTAINER_WIDTH = 1200

function makeShips(count: number): Ship[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    codename: `P${index}`,
    name: `Ship ${index}`,
    nation: 'usa',
    type: 'Cruiser' as ShipTypeId,
    tier: 10,
    isPremium: false,
    isSpecial: false,
    isHidden: false,
    description: '',
    images: { small: '', medium: 'm.png', large: '', contour: '' },
    search: `ship ${index}`,
  }))
}

/** Reports a fixed container width the way a browser's ResizeObserver would. */
function stubResizeObserver() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      observe(element: Element) {
        this.callback(
          [{ target: element, contentRect: { width: CONTAINER_WIDTH, height: 800 } }] as never,
          this as never,
        )
      }
      unobserve() {}
      disconnect() {}
    },
  )
}

/** Reports 0 first, as a browser does before layout settles, then the real width. */
function stubLateResizeObserver() {
  const observed: Array<{ cb: ResizeObserverCallback; el: Element }> = []
  vi.stubGlobal(
    'ResizeObserver',
    class {
      cb: ResizeObserverCallback
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb
      }
      observe(el: Element) {
        observed.push({ cb: this.cb, el })
        this.cb([{ target: el, contentRect: { width: 0, height: 0 } }] as never, this as never)
      }
      unobserve() {}
      disconnect() {}
    },
  )
  return (width: number) => {
    for (const { cb, el } of observed) {
      cb([{ target: el, contentRect: { width, height: 800 } }] as never, null as never)
    }
  }
}

function gridHeight(wrapper: ReturnType<typeof mount>): number {
  const style = wrapper.find('.grid').attributes('style') ?? '0'
  return Number.parseFloat(style.match(/[\d.]+/)?.[0] ?? '0')
}

function mountGrid(ships: Ship[]) {
  stubResizeObserver()
  return mount(ShipGrid, {
    props: {
      ships,
      nationBySlug: new Map<string, Nation>(),
      typeById: new Map<ShipTypeId, ShipType>(),
    },
  })
}

describe('ShipGrid', () => {
  it('keeps the DOM to a window of cards, not the whole result', async () => {
    const wrapper = mountGrid(makeShips(727))
    await flushPromises()

    const rendered = wrapper.findAll('article').length
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(80)
  })

  it('gives the page the height of the full result, so the scrollbar is stable', async () => {
    const small = mountGrid(makeShips(100))
    await flushPromises()
    const smallHeight = Number.parseFloat(
      small
        .find('.grid')
        .attributes('style')!
        .match(/[\d.]+/)![0],
    )

    const large = mountGrid(makeShips(727))
    await flushPromises()
    const largeHeight = Number.parseFloat(
      large
        .find('.grid')
        .attributes('style')!
        .match(/[\d.]+/)![0],
    )

    expect(smallHeight).toBeGreaterThan(0)
    // Roughly proportional to the result size, and fixed from first render: the
    // grid never re-sizes itself as the reader scrolls.
    expect(largeHeight).toBeGreaterThan(smallHeight * 6)
  })

  it('renders the first ships of the result at the top', async () => {
    const wrapper = mountGrid(makeShips(727))
    await flushPromises()

    expect(wrapper.text()).toContain('Ship 0')
    expect(wrapper.text()).not.toContain('Ship 700')
  })

  it('re-measures when the width arrives after the first render', async () => {
    // Regression: a reload with a restored scroll position laid the grid out at
    // width 0, the virtualizer cached rows at the gap height, and a later real
    // width did not invalidate that cache — the cards drew as overlapping strips.
    const settle = stubLateResizeObserver()
    const wrapper = mount(ShipGrid, {
      props: {
        ships: makeShips(727),
        nationBySlug: new Map<string, Nation>(),
        typeById: new Map<ShipTypeId, ShipType>(),
      },
    })
    await flushPromises()

    // Nothing is drawn before a real measurement.
    expect(wrapper.findAll('article')).toHaveLength(0)
    expect(gridHeight(wrapper)).toBe(0)

    settle(305)
    await flushPromises()

    // One column at 305 px: rows of 305 * 9 / 16 + 12.
    expect(gridHeight(wrapper)).toBe(727 * (Math.round((305 * 9) / 16) + 12))
    expect(wrapper.findAll('article').length).toBeGreaterThan(0)
  })

  it('emits the ship that was clicked', async () => {
    const ships = makeShips(727)
    const wrapper = mountGrid(ships)
    await flushPromises()

    await wrapper.find('.grid__cell').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([ships[0]])
  })
})
