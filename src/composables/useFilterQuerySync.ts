import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFiltersStore } from '@/stores/filters'
import { SHIP_TYPE_IDS, type ShipTypeId } from '@/types/ship'

/**
 * Keeps the filter state and the URL query in step, in both directions.
 *
 * The URL is the shareable form of a filtered view, and it survives a reload.
 * Writes use `replace` so that adjusting a filter does not fill the history
 * stack — only navigating to a ship pushes an entry.
 */
const KEYS = {
  search: 'q',
  nations: 'nation',
  types: 'type',
  tiers: 'tier',
  hidden: 'hidden',
  premium: 'premium',
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string' && value) return value.split(',').filter(Boolean)
  return []
}

export function useFilterQuerySync() {
  const route = useRoute()
  const router = useRouter()
  const filters = useFiltersStore()

  let applyingFromUrl = false

  function applyFromUrl() {
    applyingFromUrl = true

    const query = route.query
    const rawSearch = query[KEYS.search]
    filters.search = typeof rawSearch === 'string' ? rawSearch : ''
    filters.nations = asList(query[KEYS.nations])
    filters.types = asList(query[KEYS.types]).filter((value): value is ShipTypeId =>
      (SHIP_TYPE_IDS as readonly string[]).includes(value),
    )
    filters.tiers = asList(query[KEYS.tiers])
      .map(Number)
      .filter((tier) => Number.isInteger(tier) && tier >= 1 && tier <= 11)
    filters.showHidden = query[KEYS.hidden] === '1'
    filters.premiumOnly = query[KEYS.premium] === '1'

    applyingFromUrl = false
  }

  function writeToUrl() {
    if (applyingFromUrl) return

    const query: Record<string, string> = {}
    const search = filters.search.trim()
    if (search) query[KEYS.search] = search
    if (filters.nations.length) query[KEYS.nations] = filters.nations.join(',')
    if (filters.types.length) query[KEYS.types] = filters.types.join(',')
    if (filters.tiers.length) query[KEYS.tiers] = [...filters.tiers].sort((a, b) => a - b).join(',')
    if (filters.showHidden) query[KEYS.hidden] = '1'
    if (filters.premiumOnly) query[KEYS.premium] = '1'

    // Skip the navigation when nothing actually changed, so typing in the search
    // box does not queue identical history writes.
    const current = new URLSearchParams(route.query as Record<string, string>).toString()
    if (new URLSearchParams(query).toString() === current) return

    void router.replace({ name: route.name ?? 'ships', params: route.params, query })
  }

  applyFromUrl()

  watch(
    () => [
      filters.search,
      filters.nations,
      filters.types,
      filters.tiers,
      filters.showHidden,
      filters.premiumOnly,
    ],
    writeToUrl,
    { deep: true },
  )

  // Back and forward must move the filters too, not just the URL.
  watch(() => route.query, applyFromUrl)
}
