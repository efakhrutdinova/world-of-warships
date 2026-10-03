import { onScopeDispose, ref } from 'vue'

/**
 * Reactive `matchMedia`.
 *
 * Layout in this project is CSS-only on purpose, and this is the one thing CSS
 * cannot reach: whether a `<details>` panel starts open is a DOM attribute, not a
 * style. Fifteen lines rather than a dependency, by the same rule applied to the
 * debounce and the resize observer.
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  if (typeof window === 'undefined' || !window.matchMedia) return { matches }

  const list = window.matchMedia(query)
  matches.value = list.matches

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }
  list.addEventListener('change', onChange)
  onScopeDispose(() => list.removeEventListener('change', onChange))

  return { matches }
}
