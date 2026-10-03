import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { normalizeCatalog } from '@/api/normalize'
import { useCatalogStore } from '@/stores/catalog'
import { useFiltersStore } from '@/stores/filters'
import { catalogFixture } from './fixtures/catalog'

/** Seeds the catalogue directly, so filter behaviour is tested without the network. */
function seedCatalog() {
  const catalog = useCatalogStore()
  catalog.catalog = normalizeCatalog(catalogFixture)
  catalog.origin = 'live'
  return catalog
}

describe('filters store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hides test and event hulls until the toggle is on', () => {
    const catalog = seedCatalog()
    const filters = useFiltersStore()

    const hiddenCount = catalog.ships.filter((ship) => ship.isHidden).length
    expect(hiddenCount).toBeGreaterThan(0)
    expect(filters.filteredShips).toHaveLength(catalog.ships.length - hiddenCount)

    filters.showHidden = true
    expect(filters.filteredShips).toHaveLength(catalog.ships.length)
  })

  it('filters by nation', () => {
    seedCatalog()
    const filters = useFiltersStore()
    filters.showHidden = true

    filters.toggleNation('germany')
    expect(filters.filteredShips.every((ship) => ship.nation === 'germany')).toBe(true)
    expect(filters.filteredShips.length).toBeGreaterThan(0)
  })

  it('treats several values in one category as an OR', () => {
    seedCatalog()
    const filters = useFiltersStore()
    filters.showHidden = true

    filters.toggleNation('germany')
    const onlyGermany = filters.filteredShips.length
    filters.toggleNation('ussr')
    expect(filters.filteredShips.length).toBeGreaterThan(onlyGermany)
    expect(filters.filteredShips.every((ship) => ['germany', 'ussr'].includes(ship.nation))).toBe(
      true,
    )
  })

  it('treats different categories as an AND', () => {
    seedCatalog()
    const filters = useFiltersStore()
    filters.showHidden = true

    filters.toggleType('Destroyer')
    filters.toggleNation('germany')
    expect(filters.filteredShips).toHaveLength(0)
  })

  it('filters by tier', () => {
    seedCatalog()
    const filters = useFiltersStore()
    filters.showHidden = true

    filters.toggleTier(11)
    expect(filters.filteredShips.every((ship) => ship.tier === 11)).toBe(true)
  })

  it('toggling the same value twice clears it', () => {
    seedCatalog()
    const filters = useFiltersStore()

    filters.toggleType('Destroyer')
    expect(filters.types).toEqual(['Destroyer'])
    filters.toggleType('Destroyer')
    expect(filters.types).toEqual([])
  })

  it('searches case-insensitively once the debounce has settled', async () => {
    seedCatalog()
    const filters = useFiltersStore()
    filters.showHidden = true

    filters.search = 'PREUSSEN'
    // debouncedSearch trails `search`, so the result is unchanged this tick.
    expect(filters.filteredShips.length).toBeGreaterThan(1)

    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(filters.filteredShips).toHaveLength(1)
    expect(filters.filteredShips[0].name).toBe('Preussen')
  })

  it('narrows to premium hulls when the premium toggle is on', () => {
    const catalog = seedCatalog()
    const filters = useFiltersStore()
    filters.showHidden = true

    const premiumCount = catalog.ships.filter((ship) => ship.isPremium).length
    expect(premiumCount).toBeGreaterThan(0)

    filters.premiumOnly = true
    expect(filters.filteredShips).toHaveLength(premiumCount)
    expect(filters.filteredShips.every((ship) => ship.isPremium)).toBe(true)
  })

  it('counts active filters and resets them all', () => {
    seedCatalog()
    const filters = useFiltersStore()

    filters.toggleNation('usa')
    filters.toggleTier(10)
    filters.showHidden = true
    filters.premiumOnly = true
    expect(filters.activeCount).toBe(4)
    expect(filters.isFiltered).toBe(true)

    filters.reset()
    expect(filters.activeCount).toBe(0)
    expect(filters.isFiltered).toBe(false)
    expect(filters.premiumOnly).toBe(false)
  })

  it('counts the total against the hidden toggle, not the raw list', () => {
    const catalog = seedCatalog()
    const filters = useFiltersStore()

    expect(filters.totalShips).toBeLessThan(catalog.ships.length)
    filters.showHidden = true
    expect(filters.totalShips).toBe(catalog.ships.length)
  })
})
