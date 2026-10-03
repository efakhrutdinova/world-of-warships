<script setup lang="ts">
/**
 * Application shell. One route, so it is little more than a skip link and the
 * outlet — the page itself carries its own heading.
 */
</script>

<template>
  <a class="skip" href="#main">Skip to content</a>

  <main id="main">
    <RouterView />
  </main>
</template>

<style scoped>
.skip {
  position: absolute;
  top: -40px;
  left: var(--space-4);
  z-index: 10;
  padding: var(--space-2) var(--space-3);
  background: var(--accent-gold);
  color: #11141a;
  border-radius: var(--radius-sm);
}

.skip:focus {
  top: var(--space-2);
}
</style>
