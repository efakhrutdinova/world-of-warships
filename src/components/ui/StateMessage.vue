<script setup lang="ts">
/** Shared empty / error panel, so those two states cannot drift apart visually. */
defineProps<{ title: string; description?: string; actionLabel?: string; tone?: 'error' }>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="state" :class="{ 'state--error': tone === 'error' }" role="status">
    <h2 class="state__title">{{ title }}</h2>
    <p v-if="description" class="state__text">{{ description }}</p>
    <button v-if="actionLabel" type="button" class="state__action" @click="emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  text-align: center;
}

.state--error {
  border-color: color-mix(in srgb, var(--accent-orange) 55%, var(--border-subtle));
}

.state__title {
  font-size: 16px;
}

.state__text {
  max-width: 48ch;
  margin: 0;
  color: var(--text-secondary);
}

.state__action {
  padding: var(--space-2) var(--space-5);
  border: 1px solid var(--accent-gold);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent-gold) 14%, transparent);
  color: var(--accent-gold);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 13px;
  text-transform: uppercase;
  transition: var(--transition);
}

.state__action:hover {
  background: color-mix(in srgb, var(--accent-gold) 26%, transparent);
}
</style>
