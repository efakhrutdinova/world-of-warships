import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Mirrors a ref, trailing it by `delay` ms.
 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 200): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  onScopeDispose(() => clearTimeout(timer))

  return debounced
}
