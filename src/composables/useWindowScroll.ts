import { onMounted, onScopeDispose, ref } from 'vue'

/**
 * Tracks the window's vertical scroll offset.
 *
 * Updates are coalesced into one read per animation frame: a scroll event can fire
 * many times per frame, and reading `scrollY` in each of them would force layout
 * repeatedly.
 */
export function useWindowScroll() {
  const y = ref(0)
  let queued = false

  function onScroll() {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      y.value = window.scrollY
      queued = false
    })
  }

  onMounted(() => {
    y.value = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onScopeDispose(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { y }
}
