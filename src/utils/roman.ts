const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

/**
 * Tiers are shown as Roman numerals in game. Tier 11 is a supership and gets a
 * star instead of a numeral, matching the in-game port.
 */
export function tierLabel(tier: number): string {
  return NUMERALS[tier - 1] ?? '★'
}
