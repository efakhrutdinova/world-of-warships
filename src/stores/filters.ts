/**
 * Search and filter state, plus the filtered result.
 *
 * `search` is bound to the input and `debouncedSearch` drives the filter pass,
 * so typing stays responsive without re-running a 1000-item scan per keystroke.
 * Matching uses `ship.search`, a lowercased string precomputed during
 * normalization, so no per-keystroke lowercasing happens here either.
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { useCatalogStore } from '@/stores/catalog'
import type { Ship, ShipTypeId } from '@/types/ship'

export const useFiltersStore = defineStore('filters', () => {
  const catalog = useCatalogStore()

  const search = ref('')
  const debouncedSearch = useDebouncedRef(search, 200)
  const nations = ref<string[]>([])
  const types = ref<ShipTypeId[]>([])
  const tiers = ref<number[]>([])
  /** Test and event hulls the in-game catalogue omits; off by default. */
  const showHidden = ref(false)
  const premiumOnly = ref(false)

  const activeCount = computed(
    () =>
      nations.value.length +
      types.value.length +
      tiers.value.length +
      (showHidden.value ? 1 : 0) +
      (premiumOnly.value ? 1 : 0) +
      (search.value.trim() ? 1 : 0),
  )

  const isFiltered = computed(() => activeCount.value > 0)

  const filteredShips = computed<Ship[]>(() => {
    const nationSet = new Set(nations.value)
    const typeSet = new Set<string>(types.value)
    const tierSet = new Set(tiers.value)
    const query = debouncedSearch.value.trim().toLowerCase()
    const hidden = showHidden.value
    const premium = premiumOnly.value

    return catalog.ships.filter((ship) => {
      if (!hidden && ship.isHidden) return false
      if (premium && !ship.isPremium) return false
      if (nationSet.size && !nationSet.has(ship.nation)) return false
      if (typeSet.size && !typeSet.has(ship.type)) return false
      if (tierSet.size && !tierSet.has(ship.tier)) return false
      if (query && !ship.search.includes(query)) return false
      return true
    })
  })

  /** Total the result count is compared against, honouring the hidden toggle. */
  const totalShips = computed(
    () => catalog.ships.filter((ship) => showHidden.value || !ship.isHidden).length,
  )

  function toggle<T>(list: T[], value: T): T[] {
    const index = list.indexOf(value)
    if (index === -1) return [...list, value]
    return list.filter((_, position) => position !== index)
  }

  function toggleNation(slug: string) {
    nations.value = toggle(nations.value, slug)
  }

  function toggleType(id: ShipTypeId) {
    types.value = toggle(types.value, id)
  }

  function toggleTier(tier: number) {
    tiers.value = toggle(tiers.value, tier)
  }

  function reset() {
    search.value = ''
    nations.value = []
    types.value = []
    tiers.value = []
    showHidden.value = false
    premiumOnly.value = false
  }

  return {
    search,
    debouncedSearch,
    nations,
    types,
    tiers,
    showHidden,
    premiumOnly,
    activeCount,
    isFiltered,
    filteredShips,
    totalShips,
    toggleNation,
    toggleType,
    toggleTier,
    reset,
  }
})
