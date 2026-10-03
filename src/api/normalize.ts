/**
 * Maps the vortex payload onto the domain model.
 *
 * Pure functions, no network and no Vue, because this is where the API's
 * surprises live and therefore where the tests need to reach:
 *
 *  - a ship's type is not a field; it is whichever of its `tags` matches a key
 *    of `/vehicle_types_common/`;
 *  - `name` is an internal codename (`PASD505_Hill`), so the display name comes
 *    from `localization.mark`;
 *  - premium and special status come from the `uiPremium` / `uiSpecial` tags,
 *    and they also decide which type-icon variant the game would draw;
 *  - `catalogueHidden` marks test and event hulls the in-game catalogue omits.
 */
import { intToHex } from '@/utils/color'
import { SHIP_TYPE_IDS } from '@/types/ship'
import type { Catalog, Nation, Ship, ShipType, ShipTypeId } from '@/types/ship'
import type { CompactBundle, CompactVehicle } from '@/types/vortex'

const TYPE_IDS = new Set<string>(SHIP_TYPE_IDS)
const HIDDEN_TAGS = ['catalogueHidden', 'catalogueHiddenIfMissing']

/** Joins a media path and an icon path without doubling or dropping the slash. */
export function resolveIconUrl(mediaPath: string, iconPath: string | undefined): string {
  if (!iconPath) return ''
  if (/^https?:\/\//.test(iconPath)) return iconPath
  return `${mediaPath.replace(/\/$/, '')}/${iconPath.replace(/^\//, '')}`
}

export function resolveShipType(tags: string[]): ShipTypeId | null {
  const match = tags.find((tag) => TYPE_IDS.has(tag))
  return (match as ShipTypeId | undefined) ?? null
}

function normalizeShip(id: string, vehicle: CompactVehicle, mediaPath: string): Ship | null {
  const type = resolveShipType(vehicle.tags)
  // Without a type a ship cannot be placed in the UI at all, so it is dropped
  // rather than shown as "unknown".
  if (!type) return null

  const name = vehicle.title || vehicle.name

  return {
    id: Number(id),
    codename: vehicle.name,
    name,
    nation: vehicle.nation,
    type,
    tier: vehicle.level,
    isPremium: vehicle.tags.includes('uiPremium'),
    isSpecial: vehicle.tags.includes('uiSpecial'),
    isHidden: HIDDEN_TAGS.some((tag) => vehicle.tags.includes(tag)),
    description: '',
    images: {
      small: resolveIconUrl(mediaPath, vehicle.icons.small),
      medium: resolveIconUrl(mediaPath, vehicle.icons.medium),
      large: '',
      contour: resolveIconUrl(mediaPath, vehicle.icons.contour),
    },
    search: `${name} ${vehicle.name}`.toLowerCase(),
  }
}

export function normalizeCatalog(bundle: CompactBundle): Catalog {
  const { mediaPath } = bundle

  const ships: Ship[] = []
  for (const [id, vehicle] of Object.entries(bundle.vehicles)) {
    const ship = normalizeShip(id, vehicle, mediaPath)
    if (ship) ships.push(ship)
  }

  // The API returns nations in tree order; that order is what the game uses.
  const nations: Nation[] = bundle.nations.map((nation, index) => ({
    id: nation.id,
    slug: nation.name,
    name: nation.title || nation.name,
    color: intToHex(nation.color),
    // Two variants for two jobs: `tiny` (1.7 KB) for the 24x16 slots, `small`
    // (10 KB) for the card backdrop, where it is scaled up and dimmed. `large` is
    // 165 KB, which is not worth it for a backdrop behind a ship.
    flag: resolveIconUrl(mediaPath, nation.icons.tiny ?? nation.icons.small),
    banner: resolveIconUrl(mediaPath, nation.icons.small ?? nation.icons.tiny),
    order: index,
  }))

  const types: ShipType[] = Object.entries(bundle.types)
    .filter(([id]) => TYPE_IDS.has(id))
    .map(([id, type]) => ({
      id: id as ShipTypeId,
      name: type.title || id,
      order: type.sort_order,
      icons: {
        normal: resolveIconUrl(mediaPath, type.icons.normal ?? type.icons.default),
        premium: resolveIconUrl(mediaPath, type.icons.premium),
        special: resolveIconUrl(mediaPath, type.icons.special),
        elite: resolveIconUrl(mediaPath, type.icons.elite),
      },
    }))
    .sort((a, b) => a.order - b.order)

  // Sorted once here so every view and filter combination inherits a stable,
  // game-like order without re-sorting.
  const nationRank = new Map(nations.map((nation) => [nation.slug, nation.order]))
  const rankOf = (slug: string) => nationRank.get(slug) ?? Number.MAX_SAFE_INTEGER
  ships.sort(
    (a, b) =>
      a.tier - b.tier || rankOf(a.nation) - rankOf(b.nation) || a.name.localeCompare(b.name),
  )

  return {
    ships,
    nations,
    types,
    locale: bundle.locale,
    generatedAt: bundle.generatedAt,
    mediaPath,
  }
}

export type HullVariant = 'normal' | 'premium' | 'special'

/**
 * Which icon variant the game would draw for a hull.
 *
 * Single source of truth on purpose. The card colours the tier numeral from the
 * same value, so the numeral and the class icon cannot disagree — they did while
 * this condition lived here and the colour was hardcoded in the stylesheet.
 */
export function hullVariant(ship: Ship): HullVariant {
  if (ship.isPremium) return 'premium'
  if (ship.isSpecial) return 'special'
  return 'normal'
}

export function typeIconFor(type: ShipType, ship: Ship): string {
  return type.icons[hullVariant(ship)] || type.icons.normal
}
