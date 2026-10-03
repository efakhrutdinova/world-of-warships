import { onScopeDispose, watch, type Ref } from 'vue'

/**
 * Stops the document behind an overlay from scrolling.
 *
 * Reference counted, because two overlays can want the lock at once — a details
 * dialog opened from a page whose filter sheet is also open — and the first one to
 * close must not release it for the other.
 *
 * `scrollbar-gutter: stable` on `html` keeps the lock from shifting the layout.
 */
const LOCK_CLASS = 'has-overlay'

let holders = 0

function apply() {
  document.documentElement.classList.toggle(LOCK_CLASS, holders > 0)
}

function acquireScrollLock() {
  holders += 1
  apply()
}

function releaseScrollLock() {
  if (holders === 0) return
  holders -= 1
  apply()
}

/** Holds the lock for as long as `active` is true, releasing it on teardown. */
export function useScrollLock(active: Ref<boolean>) {
  let held = false

  function set(next: boolean) {
    if (next === held) return
    held = next
    if (next) acquireScrollLock()
    else releaseScrollLock()
  }

  watch(active, set, { immediate: true })
  onScopeDispose(() => set(false))
}

/** Resets the counter. Used by tests, which must not inherit each other's locks. */
export function resetScrollLock() {
  holders = 0
  apply()
}
