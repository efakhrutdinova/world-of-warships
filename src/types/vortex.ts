/**
 * Shapes returned by the vortex encyclopedia API, exactly as received.
 *
 * The API wraps every payload in `{ status, data }` and embeds localization
 * for 19 languages in every record, which is why `/vehicles/` weighs ~20 MB.
 * These types describe that raw form; `CompactBundle` below is the reduced
 * form the browser actually receives.
 */

export interface VortexEnvelope<T> {
  status: string
  data: T
}

/** Localized string keyed by locale code: `{ en: 'Hill', ru: 'Hill', ... }`. */
export type VortexLocalized = Record<string, string>

export interface VortexLocalization {
  mark?: VortexLocalized
  shortmark?: VortexLocalized
  description?: VortexLocalized
}

export interface VortexVehicle {
  level: number
  /** Internal codename such as `PASD505_Hill`, not a display name. */
  name: string
  nation: string
  tags: string[]
  icons: Record<string, string>
  localization: VortexLocalization
}

export type VortexVehicles = Record<string, VortexVehicle>

export interface VortexNation {
  name: string
  id: number
  /** Packed 24-bit integer, e.g. 14764062. */
  color: number
  tags: string[]
  icons: Record<string, string>
  localization: VortexLocalization
}

export interface VortexShipType {
  sort_order: number
  icons: Record<string, string>
  localization: VortexLocalization
}

export type VortexShipTypes = Record<string, VortexShipType>

/* ------------------------------------------------------------------ *
 * Compact form: what the proxy and the snapshot serve to the browser.
 * Localization is already resolved to a single locale.
 * ------------------------------------------------------------------ */

export interface CompactVehicle {
  level: number
  name: string
  nation: string
  tags: string[]
  /** `small`, `medium` and `contour` only; `large` lives in the details payload. */
  icons: Record<string, string>
  title: string
}

export interface CompactNation {
  name: string
  id: number
  color: number
  icons: Record<string, string>
  title: string
}

export interface CompactShipType {
  sort_order: number
  icons: Record<string, string>
  title: string
}

/**
 * The list payload. Deliberately excludes ship descriptions and large artwork:
 * together those were 52% of the bytes while only the details dialog needs them.
 */
export interface CompactBundle {
  /** ISO timestamp; shown in the UI when running off the snapshot. */
  generatedAt: string
  locale: string
  /** CDN prefix that `icons.*` paths are relative to. */
  mediaPath: string
  vehicles: Record<string, CompactVehicle>
  nations: CompactNation[]
  types: Record<string, CompactShipType>
}

export interface CompactDetail {
  description: string
  /** Full-size artwork path, relative to `mediaPath`. */
  large: string
}

/** Fetched lazily, the first time a details dialog opens. */
export type CompactDetails = Record<string, CompactDetail>

/** Everything the upstream reader produces; the server slices it into the two payloads above. */
export interface FullBundle extends CompactBundle {
  details: CompactDetails
}
