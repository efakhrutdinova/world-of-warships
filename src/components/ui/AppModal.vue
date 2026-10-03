<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useScrollLock } from '@/composables/useScrollLock'

/**
 * Thin wrapper over the native `<dialog>` element.
 *
 * `showModal()` already provides the focus trap, Escape handling, the top layer,
 * an inert background and `::backdrop` — so no dialog library is needed, and the
 * wrapper stays smaller than one would be.
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
/*
 * Mobile first: full screen.
 *
 * `inset: 0` rather than `margin: 0` — a dialog is centred by auto margins, and
 * zeroing them alone pinned it to the top edge. `dvh` follows the browser's own
 * chrome as it hides and reappears.
 */
.modal {
  inset: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  /* The dialog itself never scrolls; one child does. See `.modal__body`. */
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--surface-overlay);
  color: var(--text-primary);
  box-shadow: var(--shadow-overlay);
}

/*
 * Only applied while open. A bare `display: flex` would override the UA's
 * `dialog:not([open]) { display: none }` and leave a closed dialog on the page.
 */
.modal[open] {
  display: flex;
}

.modal::backdrop {
  background: rgb(0 0 0 / 72%);
  backdrop-filter: blur(2px);
}

/*
 * A flex column that does not scroll. The content decides which single part of
 * itself is scrollable — for ship details that is the description — so the dialog
 * never shows a scrollbar around its own chrome.
 *
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
/*
 * Wide screens: a window again, centred in the viewport.
 *
 * The insets stay at 0 and the centring comes from `margin: auto`. `inset: auto`
 * looks like the way to undo a full-screen dialog, but it is what breaks it: the
 * user agent centres a modal dialog by pinning all four insets to 0 and letting auto
 * margins distribute the slack, so removing the insets left the dialog in its static
 * position against the top-right corner. `height: fit-content` is needed for the same
 * reason — with both block insets at 0, an `auto` height would stretch to fill.
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
