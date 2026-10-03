/** The API stores nation colours as packed 24-bit integers, e.g. 14764062. */
export function intToHex(value: number): string {
  return `#${(value & 0xffffff).toString(16).padStart(6, '0')}`
}
