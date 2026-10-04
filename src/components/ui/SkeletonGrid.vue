<script setup lang="ts">
/**
 * Placeholder cards for the initial load.
 */
withDefaults(defineProps<{ count?: number }>(), { count: 12 })
</script>

<template>
  <div class="skeletons" aria-hidden="true">
    <div v-for="index in count" :key="index" class="skeleton">
      <div class="skeleton__art"></div>
      <div class="skeleton__line skeleton__line--wide"></div>
      <div class="skeleton__line"></div>
    </div>
  </div>
</template>

<style scoped>
.skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.skeleton {
  padding-bottom: var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
}

.skeleton__art {
  aspect-ratio: 16 / 9;
  background: var(--surface-sunken);
}

.skeleton__line {
  height: 10px;
  margin: var(--space-3) var(--space-3) 0;
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
}

.skeleton__line--wide {
  width: 70%;
}

.skeleton__art,
.skeleton__line {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
</style>
