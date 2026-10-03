import { onScopeDispose, ref } from 'vue'

/**
 * Reactive `matchMedia` for a mobile-first breakpoint: true once the viewport is at
 * least `width` pixels wide.
 *
 * Takes a number rather than a query string, because the project only ever asks this
 * one question and a bare number cannot encode the wrong direction. It mirrors the
 * `min-width` queries in the stylesheets, so the CSS and the one JavaScript
 * breakpoint cannot disagree about which way round they are.
 *
 * Fifteen lines rather than a dependency, by the same rule applied to the debounce
 * and the resize observer.
 */
export function useMinWidth(width: number) {
  const matches = ref(false)

  if (typeof window === 'undefined' || !window.matchMedia) return { matches }

  const list = window.matchMedia(`(min-width: ${width}px)`)
  matches.value = list.matches

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }
  list.addEventListener('change', onChange)
  onScopeDispose(() => list.removeEventListener('change', onChange))

  return { matches }
}
