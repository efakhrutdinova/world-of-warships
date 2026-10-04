export const SHIP_TYPE_IDS = [
  'Submarine',
  'Destroyer',
  'Cruiser',
  'Battleship',
  'AirCarrier',
] as const

export type ShipTypeId = (typeof SHIP_TYPE_IDS)[number]

/** Tier 11 ships are superships; the game shows a star instead of a numeral. */
export const SUPERSHIP_TIER = 11

export interface ShipImages {
  small: string
  medium: string
  large: string
  contour: string
}

export interface Ship {
  id: number
  /** Internal codename, kept for debugging and as a search fallback. */
  codename: string
  name: string
  nation: string
  type: ShipTypeId
  tier: number
  isPremium: boolean
  isSpecial: boolean
  /** Hidden from the in-game catalogue: test hulls, event hulls. */
  isHidden: boolean
  description: string
  images: ShipImages
  /** Lowercased `name + codename` precomputed once, so search never rebuilds it. */
  search: string
}

export interface Nation {
  id: number
  slug: string
  name: string
  /** CSS hex colour derived from the API's packed integer. */
  color: string
  /** Smallest variant, for the 24x16 slots in chips and filter tiles. */
  flag: string
  /** Larger variant, used as the backdrop behind a ship's artwork on a card. */
  banner: string
  order: number
}

export interface ShipType {
  id: ShipTypeId
  name: string
  order: number
  /** Icon variants; which one applies depends on the hull's premium status. */
  icons: {
    normal: string
    premium: string
    special: string
    elite: string
  }
}

export interface Catalog {
  ships: Ship[]
  nations: Nation[]
  types: ShipType[]
  locale: string
  generatedAt: string
  /** CDN prefix, kept so lazily loaded detail artwork can be resolved later. */
  mediaPath: string
}
