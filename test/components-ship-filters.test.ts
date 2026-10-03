/**
 * Component-level check that the filter UI is actually wired to the result set —
 * the connection a store-only test cannot prove.
 */
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ShipFilters from '@/components/ShipFilters.vue'
import { normalizeCatalog } from '@/api/normalize'
import { useCatalogStore } from '@/stores/catalog'
import { useFiltersStore } from '@/stores/filters'
import { resetScrollLock } from '@/composables/useScrollLock'
import { catalogFixture } from './fixtures/catalog'

describe('ShipFilters', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    const catalog = useCatalogStore()
    catalog.catalog = normalizeCatalog(catalogFixture)
    catalog.origin = 'live'
  })

  function renderFilters() {
    return render(ShipFilters, { global: { plugins: [pinia] } })
  }

  it('renders one tile per nation and per type', () => {
    renderFilters()
    expect(screen.getByRole('button', { name: 'Germany' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Destroyer' })).toBeTruthy()
  })

  it('narrows the result set when a nation tile is pressed', async () => {
    renderFilters()
    const filters = useFiltersStore()
    const before = filters.filteredShips.length

    await userEvent.click(screen.getByRole('button', { name: 'Germany' }))

    expect(filters.nations).toEqual(['germany'])
    expect(filters.filteredShips.length).toBeLessThan(before)
    expect(screen.getByRole('button', { name: 'Germany' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
  })

  it('shows the result count against the total', async () => {
    renderFilters()
    await userEvent.click(screen.getByRole('button', { name: 'Germany' }))
    expect(screen.getByText(/of \d+ ships$/)).toBeTruthy()
  })

  it('reveals hidden hulls through its switch', async () => {
    renderFilters()
    const filters = useFiltersStore()
    const before = filters.filteredShips.length

    await userEvent.click(screen.getByRole('switch', { name: /test and event hulls/i }))

    expect(filters.showHidden).toBe(true)
    expect(filters.filteredShips.length).toBeGreaterThan(before)
  })

  it('offers a premium-only switch, announced as on and off', async () => {
    renderFilters()
    const filters = useFiltersStore()
    const control = screen.getByRole('switch', { name: /premium only/i })

    expect(
      control.getAttribute('aria-checked') ?? String(control.hasAttribute('checked')),
    ).not.toBe('true')

    await userEvent.click(control)

    expect(filters.premiumOnly).toBe(true)
    expect((control as HTMLInputElement).checked).toBe(true)
  })

  it('shows a disclosure chevron beside the Filters label', () => {
    const { container } = renderFilters()
    expect(container.querySelector('.filters__chevron')).not.toBeNull()
  })

  it('offers reset only while a filter is active, and clears everything', async () => {
    renderFilters()
    const filters = useFiltersStore()
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Tier X' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(filters.tiers).toEqual([])
    expect(filters.activeCount).toBe(0)
  })
})

describe('ShipFilters on a narrow screen', () => {
  let pinia: ReturnType<typeof createPinia>

  /** Reports the mobile breakpoint as matching, the way a phone viewport would. */
  function stubNarrowViewport() {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('max-width: 720px'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  }

  beforeEach(() => {
    resetScrollLock()
    stubNarrowViewport()
    pinia = createPinia()
    setActivePinia(pinia)
    const catalog = useCatalogStore()
    catalog.catalog = normalizeCatalog(catalogFixture)
    catalog.origin = 'live'
  })

  afterEach(resetScrollLock)

  it('starts closed, so the sheet does not cover the ships on load', () => {
    const { container } = render(ShipFilters, { global: { plugins: [pinia] } })
    const panel = container.querySelector('details')!

    expect(panel.open).toBe(false)
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
  })

  it('locks the page while the sheet is open, and releases it on close', async () => {
    const { container } = render(ShipFilters, { global: { plugins: [pinia] } })
    const panel = container.querySelector('details')!

    await userEvent.click(container.querySelector('summary')!)
    expect(panel.open).toBe(true)
    expect(document.documentElement.classList.contains('has-overlay')).toBe(true)

    await userEvent.click(container.querySelector('summary')!)
    expect(panel.open).toBe(false)
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
  })
})
