import { onScopeDispose, ref } from 'vue'

/**
 * Reactive `matchMedia` for a mobile-first breakpoint: true once the viewport is at
 * least `width` pixels wide.
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
