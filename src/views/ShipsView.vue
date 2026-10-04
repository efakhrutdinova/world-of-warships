<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ShipDetailsDialog from '@/components/ShipDetailsDialog.vue'
import ShipFilters from '@/components/ShipFilters.vue'
import ShipGrid from '@/components/ShipGrid.vue'
import BackToTop from '@/components/ui/BackToTop.vue'
import SkeletonGrid from '@/components/ui/SkeletonGrid.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import { useFilterQuerySync } from '@/composables/useFilterQuerySync'
import { useCatalogStore } from '@/stores/catalog'
import { useFiltersStore } from '@/stores/filters'
import type { Nation, Ship, ShipType, ShipTypeId } from '@/types/ship'

const catalog = useCatalogStore()
const filters = useFiltersStore()

useFilterQuerySync()

/** Lookup maps built once per catalogue load, not per card. */
const nationBySlug = computed(
  () => new Map<string, Nation>(catalog.nations.map((nation) => [nation.slug, nation])),
)
const typeById = computed(
  () => new Map<ShipTypeId, ShipType>(catalog.types.map((type) => [type.id, type])),
)

const selectedShip = ref<Ship | null>(null)

const snapshotDate = computed(() => {
  if (!catalog.generatedAt) return ''
  return new Date(catalog.generatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

/**
 * A filter change replaces the result set, so the reader's position in the old one
 * means nothing. Returning to the top shows the new result from its beginning —
 * and on a phone, where the filter panel is a full-screen sheet, it is the only way
 * the first results are visible after closing it.
 */
watch(
  () => [
    filters.debouncedSearch,
    filters.nations,
    filters.types,
    filters.tiers,
    filters.showHidden,
    filters.premiumOnly,
  ],
  () => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 })
  },
  { deep: true },
)

onMounted(() => {
  void catalog.load()
})
</script>

<template>
  <div class="container ships">
    <header class="ships__header">
      <h1 class="ships__title">Ships</h1>
    </header>

    <!--
      Shown only when live data failed and the committed snapshot is in use, so a
      vortex outage degrades the page instead of emptying it.
    -->
    <p v-if="catalog.isStale" class="ships__notice" role="status">
      The encyclopedia service is unavailable. Showing a stored copy of the catalogue from
      {{ snapshotDate }}.
    </p>

    <ShipFilters v-if="catalog.isReady" />

    <SkeletonGrid v-if="catalog.isLoading && !catalog.isReady" />

    <StateMessage
      v-else-if="catalog.error"
      tone="error"
      title="Could not load the ship catalogue"
      :description="catalog.error"
      action-label="Try again"
      @action="catalog.load()"
    />

    <StateMessage
      v-else-if="catalog.isReady && filters.filteredShips.length === 0"
      title="No ships match these filters"
      description="Clear a filter or change the search term to see more results."
      action-label="Reset filters"
      @action="filters.reset()"
    />

    <ShipGrid
      v-else-if="catalog.isReady"
      :ships="filters.filteredShips"
      :nation-by-slug="nationBySlug"
      :type-by-id="typeById"
      @select="selectedShip = $event"
    />

    <ShipDetailsDialog :ship="selectedShip" @close="selectedShip = null" />

    <BackToTop />
  </div>
</template>

<style scoped>
.ships {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-5) var(--space-6);
}

.ships__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ships__title {
  font-size: 24px;
}

.ships__notice {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--accent-orange) 50%, var(--border-subtle));
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent-orange) 10%, var(--surface-raised));
  color: var(--text-primary);
}

@media (min-width: 720px) {
  .ships__title {
    font-size: 30px;
  }
}
</style>
