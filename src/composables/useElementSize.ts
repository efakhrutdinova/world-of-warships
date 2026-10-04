import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Tracks an element's content-box size with a `ResizeObserver`.
 *
 * The virtualized grid needs the container width to decide how many columns fit;
 * a CSS media query cannot report that number to JavaScript.
 *
 */
export function useElementSize(target: Ref<HTMLElement | null>) {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | undefined

  function disconnect() {
    observer?.disconnect()
    observer = undefined
  }

  watch(
    target,
    (element) => {
      disconnect()
      if (!element) return

      observer = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect
        if (!box) return

        const nextWidth = Math.round(box.width)
        const nextHeight = Math.round(box.height)
        if (nextWidth !== width.value) width.value = nextWidth
        if (nextHeight !== height.value) height.value = nextHeight
      })
      observer.observe(element)
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(disconnect)

  return { width, height }
}
