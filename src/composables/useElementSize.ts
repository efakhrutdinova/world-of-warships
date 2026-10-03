import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Tracks an element's content-box size with a `ResizeObserver`.
 *
 * The virtualized grid needs the container width to decide how many columns fit;
 * a CSS media query cannot report that number to JavaScript.
 *
 * Sizes are rounded and published only when they actually change, so a subpixel
 * jitter cannot start a reaction. Two other guards sit outside this file and
 * matter as much: callers observe an element they do not resize themselves (see
 * `ShipGrid`'s width probe), and `scrollbar-gutter: stable` in the base stylesheet
 * stops an appearing scrollbar from narrowing the container. Together they close
 * the feedback path the browser reports as "ResizeObserver loop completed with
 * undelivered notifications".
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
