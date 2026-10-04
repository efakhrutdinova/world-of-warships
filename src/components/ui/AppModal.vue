<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useScrollLock } from '@/composables/useScrollLock'

/**
 * Thin wrapper over the native `<dialog>` element.
 *
 * The one thing `<dialog>` does not do is stop the page behind it from scrolling,
 * so it takes the shared scroll lock while open.
 */
const props = defineProps<{ open: boolean; label: string }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

// Shared with the mobile filter sheet, and reference counted, so whichever closes
// first does not unlock the page for the other.
useScrollLock(computed(() => props.open))

watch(
  () => props.open,
  (open) => {
    const element = dialog.value
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
})

/** Fires for Escape and for `close()`, so one handler covers every exit path. */
function onClose() {
  if (props.open) emit('close')
}

/** `<dialog>` treats the backdrop as part of the element, so compare the target. */
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close')
}
</script>

<template>
  <dialog ref="dialog" :aria-label="label" class="modal" @close="onClose" @click="onClick">
    <div class="modal__body">
      <button type="button" class="modal__close" aria-label="Close" @click="emit('close')">
        &#x2715;
      </button>
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  inset: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--surface-overlay);
  color: var(--text-primary);
  box-shadow: var(--shadow-overlay);
}

.modal[open] {
  display: flex;
}

.modal::backdrop {
  background: rgb(0 0 0 / 72%);
  backdrop-filter: blur(2px);
}

/*
 * `min-height: 0` is what allows that child to shrink below its content height;
 * without it a flex item refuses to and the overflow moves back up here.
 */
.modal__body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.modal__close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  z-index: 1;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: rgb(0 0 0 / 50%);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.modal__close:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

/*
 * Full screen on a phone. `inset: 0` rather than `margin: 0`: a dialog is centred
 * by auto margins, and zeroing them alone pinned it to the top edge. `dvh` follows
 * the browser's own chrome as it hides and reappears.
 */
@media (min-width: 720px) {
  .modal {
    inset: 0;
    width: min(960px, calc(100vw - 2 * var(--space-4)));
    max-width: none;
    height: fit-content;
    max-height: calc(100vh - 2 * var(--space-5));
    margin: auto;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
  }
}
</style>
