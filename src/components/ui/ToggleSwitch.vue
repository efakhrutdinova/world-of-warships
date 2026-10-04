<script setup lang="ts">
/**
 * A switch for a boolean filter.
 */
const model = defineModel<boolean>({ required: true })
defineProps<{ label: string }>()
</script>

<template>
  <label class="switch">
    <input v-model="model" type="checkbox" role="switch" class="switch__input" />
    <span class="switch__track" aria-hidden="true"><span class="switch__thumb"></span></span>
    <span class="switch__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  color: var(--text-secondary);
  cursor: pointer;
}

/* Kept in the accessibility tree and focusable, but drawn by the track below. */
.switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.switch__track {
  position: relative;
  flex: none;
  width: 36px;
  height: 20px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-sunken);
  transition:
    background-color var(--transition),
    border-color var(--transition);
}

.switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-muted);
  transition:
    transform var(--transition),
    background-color var(--transition);
}

.switch__input:checked + .switch__track {
  border-color: var(--accent-gold);
  background: color-mix(in srgb, var(--accent-gold) 28%, var(--surface-sunken));
}

.switch__input:checked + .switch__track .switch__thumb {
  transform: translateX(16px);
  background: var(--accent-gold);
}

.switch__input:focus-visible + .switch__track {
  outline: 2px solid var(--accent-steel-bright);
  outline-offset: 2px;
}

.switch:hover .switch__label {
  color: var(--text-primary);
}

.switch__label {
  font-size: 13px;
  transition: color var(--transition);
}
</style>
