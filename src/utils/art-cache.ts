/**
 * Remembers which ship artwork has already been displayed, for the lifetime of the
 * page.
 *
 * The browser already caches the image bytes. What it cannot carry is the card's
 * own state: the virtualizer destroys a row when it leaves the viewport, so the
 * next `ShipCard` for that ship is a fresh component that starts out knowing
 * nothing — it would hide its artwork again and replay the fade-in, which reads as
 * the ship reloading on every scroll back.
 */
const shown = new Set<string>()

export function hasShownArt(url: string): boolean {
  return shown.has(url)
}

export function rememberArt(url: string): void {
  if (url) shown.add(url)
}

/** Resets the cache. Used by tests, which must not inherit each other's state. */
export function clearArtCache(): void {
  shown.clear()
}
