<script setup lang="ts">
/**
 * A pressable filter tile.
 */
defineProps<{ pressed: boolean; label: string; compact?: boolean }>()
</script>

<template>
  <button
    type="button"
    class="tile"
    :class="{ 'tile--on': pressed, 'tile--compact': compact }"
    :aria-pressed="pressed"
    :aria-label="label"
    :title="label"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
.tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 13px;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition);
}

.tile--compact {
  min-width: 40px;
  padding: var(--space-2);
}

.tile:hover:not(.tile--on) {
  border-color: var(--border-strong);
  background: var(--surface-hover);
  color: var(--text-primary);
}

.tile--on {
  border-color: var(--accent-gold);
  background: color-mix(in srgb, var(--accent-steel) 22%, var(--surface-raised));
  color: var(--accent-gold);
}
</style>
