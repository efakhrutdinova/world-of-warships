/**
 * Owns the catalogue: loading, failure state, and the lazily fetched details.
 *
 * A store rather than a module-level composable so that the data layer has one
 * explicit owner. The previous iteration of this project kept the same state in
 * two unused composables plus a copy inside the root component; a store makes
 * that split impossible.
 */
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { loadCatalog, loadShipDetail, loadSnapshotDetails, type CatalogOrigin } from '@/api/catalog'
import { ApiError } from '@/api/client'
import { normalizeCatalog } from '@/api/normalize'
import type { Catalog, Nation, Ship, ShipType } from '@/types/ship'
import type { CompactDetail, CompactDetails } from '@/types/vortex'

const DEFAULT_LOCALE = 'en'

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'timeout':
        return 'The encyclopedia service did not respond in time.'
      case 'http':
        return `The encyclopedia service replied with an error (${error.status ?? 'unknown'}).`
      case 'payload':
        return 'The encyclopedia service returned an unreadable response.'
      default:
        return 'The encyclopedia service is unreachable.'
    }
  }
  return 'The ship catalogue could not be loaded.'
}

export const useCatalogStore = defineStore('catalog', () => {
  // shallowRef: ~1000 ship objects are replaced wholesale and never mutated in
  // place, so deep reactivity would only cost traversal time.
  const catalog = shallowRef<Catalog | null>(null)
  const details = shallowRef<CompactDetails>({})
  const origin = ref<CatalogOrigin | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const locale = ref(DEFAULT_LOCALE)

  const ships = computed<Ship[]>(() => catalog.value?.ships ?? [])
  const nations = computed<Nation[]>(() => catalog.value?.nations ?? [])
  const types = computed<ShipType[]>(() => catalog.value?.types ?? [])
  const isReady = computed(() => catalog.value !== null)
  /** True when live data failed and the committed snapshot is being shown. */
  const isStale = computed(() => origin.value === 'snapshot')
  const generatedAt = computed(() => catalog.value?.generatedAt ?? null)

  /** Deduplicates concurrent loads, e.g. a retry fired while one is in flight. */
  let pending: Promise<void> | null = null

  async function load(): Promise<void> {
    if (pending) return pending

    isLoading.value = true
    error.value = null

    pending = (async () => {
      try {
        const source = await loadCatalog(locale.value)
        catalog.value = normalizeCatalog(source.bundle)
        origin.value = source.origin
      } catch (cause) {
        error.value = messageFor(cause)
      } finally {
        isLoading.value = false
        pending = null
      }
    })()

    return pending
  }

  const detailRequests = new Map<number, Promise<void>>()
  let snapshotDetailsPending: Promise<void> | null = null

  /** The snapshot cannot be sliced per ship, so it is read once, in full. */
  function loadAllSnapshotDetails(): Promise<void> {
    snapshotDetailsPending ??= loadSnapshotDetails(locale.value)
      .then((all) => {
        details.value = { ...all, ...details.value }
      })
      .catch(() => {
        // Leaves dialogs in their "no description available" state.
      })
    return snapshotDetailsPending
  }

  /**
   * Loads one ship's description and artwork on demand.
   *
   * Descriptions and full-size artwork are 52% of the catalogue's bytes, and a
   * dialog needs exactly one of them, so nothing is fetched until a ship is
   * opened. A failure is swallowed: the dialog still has everything from the list
   * payload, and a missing description is a visible state, not an error.
   */
  function ensureDetail(id: number): Promise<void> {
    if (details.value[id]) return Promise.resolve()

    const currentOrigin = origin.value
    if (!currentOrigin) return Promise.resolve()
    if (currentOrigin === 'snapshot') return loadAllSnapshotDetails()

    const existing = detailRequests.get(id)
    if (existing) return existing

    const request = loadShipDetail(locale.value, id)
      .then((detail: CompactDetail) => {
        details.value = { ...details.value, [id]: detail }
      })
      .catch(() => {
        // Same as above: the dialog degrades, nothing is logged.
      })
      .finally(() => {
        detailRequests.delete(id)
      })

    detailRequests.set(id, request)
    return request
  }

  function shipById(id: number): Ship | null {
    return ships.value.find((ship) => ship.id === id) ?? null
  }

  return {
    catalog,
    details,
    origin,
    isLoading,
    error,
    locale,
    ships,
    nations,
    types,
    isReady,
    isStale,
    generatedAt,
    load,
    ensureDetail,
    shipById,
  }
})
