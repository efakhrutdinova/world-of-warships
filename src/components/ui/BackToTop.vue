<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll } from '@/composables/useWindowScroll'

/**
 * Returns to the top of the list.
 *
 * With a thousand ships a reader can end up a long way down, and the filter panel
 * lives at the top. Appears only once there is something to scroll back from.
 */
const { y } = useWindowScroll()

/** Roughly one viewport down, so the button does not appear during a small nudge. */
const isVisible = computed(() => y.value > 600)

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="back-to-top">
    <button v-if="isVisible" type="button" class="back-to-top" @click="toTop">
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 13V4m0 0L4 8m4-4l4 4" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <span class="visually-hidden">Back to top</span>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--surface-raised) 92%, transparent);
  color: var(--accent-steel-bright);
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: var(--shadow-raised);
  transition:
    border-color var(--transition),
    color var(--transition);
}

.back-to-top:hover {
  border-color: var(--accent-steel-bright);
  color: var(--text-primary);
}

.back-to-top svg {
  width: 18px;
  height: 18px;
}

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition:
    opacity 140ms ease-out,
    transform 140ms ease-out;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
