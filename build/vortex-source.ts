/**
 * Upstream reader for the vortex encyclopedia API. Runs in Node only: it is
 * used by the dev/preview proxy plugin and by `scripts/fetch-data.ts`.
 *
 * Two reasons this layer exists instead of the browser calling vortex directly:
 *
 * 1. vortex sends no `Access-Control-Allow-Origin` header, so a browser request
 *    from any origin is blocked.
 * 2. `/vehicles/` is ~20 MB uncompressed and ignores `Accept-Encoding: gzip`,
 *    because every record carries localization for 19 languages. Resolving one
 *    locale and dropping unused icon variants here cuts that to ~100 KB before
 *    a single byte reaches the client.
 *
 * In production this would be a BFF endpoint. The contract is the same either
 * way: one GET returns one `CompactBundle`.
 */
import type {
  CompactDetails,
  CompactNation,
  CompactShipType,
  CompactVehicle,
  FullBundle,
  VortexEnvelope,
  VortexLocalization,
  VortexNation,
  VortexShipTypes,
  VortexVehicles,
} from '../src/types/vortex.ts'

const API_BASE = 'https://vortex.worldofwarships.eu/api/encyclopedia'
const UPSTREAM_TIMEOUT_MS = 60_000

/** Icon variants the UI uses. Everything else is dropped. */
const VEHICLE_ICONS = ['small', 'medium', 'contour'] as const
const NATION_ICONS = ['tiny', 'small'] as const
const TYPE_ICONS = ['default', 'normal', 'premium', 'special', 'elite'] as const

export class VortexUpstreamError extends Error {
  endpoint: string
  detail: string

  constructor(endpoint: string, detail: string) {
    super(`vortex ${endpoint}: ${detail}`)
    this.name = 'VortexUpstreamError'
    this.endpoint = endpoint
    this.detail = detail
  }
}

async function getEnvelope<T>(locale: string, endpoint: string): Promise<T> {
  const url = `${API_BASE}/${locale}/${endpoint}/`

  let response: Response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
  } catch (cause) {
    throw new VortexUpstreamError(
      endpoint,
      cause instanceof Error ? cause.message : 'network error',
    )
  }

  if (!response.ok) {
    throw new VortexUpstreamError(endpoint, `HTTP ${response.status}`)
  }

  const envelope = (await response.json()) as VortexEnvelope<T>
  if (envelope.status !== 'ok') {
    throw new VortexUpstreamError(endpoint, `status "${envelope.status}"`)
  }

  return envelope.data
}

/** Resolves a localized field, falling back to English and then to any locale. */
function pickLocale(
  localization: VortexLocalization | undefined,
  field: keyof VortexLocalization,
  locale: string,
): string {
  const values = localization?.[field]
  if (!values) return ''
  return values[locale] ?? values.en ?? Object.values(values)[0] ?? ''
}

function pickIcons(icons: Record<string, string> | undefined, keep: readonly string[]) {
  const result: Record<string, string> = {}
  for (const key of keep) {
    const value = icons?.[key]
    if (value) result[key] = value
  }
  return result
}

export async function fetchFullBundle(locale: string): Promise<FullBundle> {
  // Fired together: four independent endpoints, and /vehicles/ dominates the wait.
  const [vehicles, nations, types, mediaPath] = await Promise.all([
    getEnvelope<VortexVehicles>(locale, 'vehicles'),
    getEnvelope<VortexNation[]>(locale, 'nations'),
    getEnvelope<VortexShipTypes>(locale, 'vehicle_types_common'),
    getEnvelope<string>(locale, 'media_path'),
  ])

  const compactVehicles: Record<string, CompactVehicle> = {}
  const details: CompactDetails = {}
  for (const [id, vehicle] of Object.entries(vehicles)) {
    compactVehicles[id] = {
      level: vehicle.level,
      name: vehicle.name,
      nation: vehicle.nation,
      tags: vehicle.tags ?? [],
      icons: pickIcons(vehicle.icons, VEHICLE_ICONS),
      title: pickLocale(vehicle.localization, 'mark', locale),
    }
    details[id] = {
      description: pickLocale(vehicle.localization, 'description', locale),
      large: vehicle.icons?.large ?? '',
    }
  }

  const compactNations: CompactNation[] = nations.map((nation) => ({
    name: nation.name,
    id: nation.id,
    color: nation.color,
    icons: pickIcons(nation.icons, NATION_ICONS),
    title: pickLocale(nation.localization, 'mark', locale),
  }))

  const compactTypes: Record<string, CompactShipType> = {}
  for (const [id, type] of Object.entries(types)) {
    compactTypes[id] = {
      sort_order: type.sort_order,
      icons: pickIcons(type.icons, TYPE_ICONS),
      title: pickLocale(type.localization, 'mark', locale),
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    locale,
    mediaPath,
    vehicles: compactVehicles,
    nations: compactNations,
    types: compactTypes,
    details,
  }
}
