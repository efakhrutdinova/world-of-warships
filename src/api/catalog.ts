/**
 * Catalogue transport with a two-step strategy.
 *
 * 1. Live: the dev/preview proxy (a BFF stand-in) at `/api/catalog`, which reads
 *    vortex and reduces the payload.
 * 2. Snapshot: `public/data/catalog.<locale>.json`, committed to the repository.
 *
 * The fallback is what keeps a static `dist/` usable and what the UI reports
 * when vortex is unavailable — the behaviour the task asks for under
 * "error handling (e.g. if the vortex service is unavailable)".
 */
import { ApiError, getJson } from './client'
import type { CompactBundle, CompactDetail, CompactDetails } from '@/types/vortex'

export type CatalogOrigin = 'live' | 'snapshot'

export interface CatalogSource {
  bundle: CompactBundle
  origin: CatalogOrigin
}

const liveListUrl = (locale: string) => `/api/catalog?locale=${locale}`
const liveDetailUrl = (locale: string, id: number) => `/api/catalog/details/${id}?locale=${locale}`
const snapshotListUrl = (locale: string) => `${import.meta.env.BASE_URL}data/catalog.${locale}.json`
const snapshotDetailsUrl = (locale: string) =>
  `${import.meta.env.BASE_URL}data/details.${locale}.json`

export async function loadCatalog(locale: string): Promise<CatalogSource> {
  try {
    return { bundle: await getJson<CompactBundle>(liveListUrl(locale)), origin: 'live' }
  } catch (liveError) {
    try {
      return { bundle: await getJson<CompactBundle>(snapshotListUrl(locale)), origin: 'snapshot' }
    } catch {
      // The live failure is the informative one; the snapshot is only a safety net.
      throw liveError instanceof ApiError
        ? liveError
        : new ApiError('network', 'Catalogue is unavailable')
    }
  }
}

/** One ship's description and artwork from the live proxy (~0.5 KB). */
export function loadShipDetail(locale: string, id: number): Promise<CompactDetail> {
  return getJson<CompactDetail>(liveDetailUrl(locale, id))
}

/**
 * The whole details map from the committed snapshot.
 *
 * The snapshot is a static file and cannot be sliced per ship, so this path reads
 * it once. The caller owns that caching; this module stays stateless and
 * therefore testable without resetting module globals between cases.
 */
export function loadSnapshotDetails(locale: string): Promise<CompactDetails> {
  return getJson<CompactDetails>(snapshotDetailsUrl(locale))
}
