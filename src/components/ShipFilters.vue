<script setup lang="ts">
import { computed, ref } from 'vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import ToggleTile from '@/components/ui/ToggleTile.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useScrollLock } from '@/composables/useScrollLock'
import { tierLabel } from '@/utils/roman'
import { useCatalogStore } from '@/stores/catalog'
import { useFiltersStore } from '@/stores/filters'

/**
 * Filter panel: nations, types and tiers as pressable tiles, mirroring the
 * in-game port filter rather than a column of checkboxes.
 *
 * On narrow screens the panel collapses into a native `<details>` disclosure —
 * accessible and keyboard-operable with no JavaScript breakpoint involved.
 */
const catalog = useCatalogStore()
const filters = useFiltersStore()

/**
 * The one JavaScript breakpoint in the app, and an unavoidable one: whether a
 * `<details>` starts open is a DOM attribute, not a style, so CSS cannot decide it.
 *
 * On a phone the panel is a full-screen sheet, and a page that opens with its
 * filters covering the ships is the wrong first impression — so it starts closed
 * there and open on a wider screen.
 */
const isNarrow = useMediaQuery('(max-width: 720px)').matches
const isOpen = ref(!isNarrow.value)

/**
 * While the sheet covers the screen the page behind it must not scroll; the sheet
 * scrolls on its own. On a wide screen the panel is part of the page, so it takes no
 * lock.
 */
useScrollLock(computed(() => isOpen.value && isNarrow.value))

const tiers = computed(() => {
  const present = new Set(catalog.ships.map((ship) => ship.tier))
  return [...present].sort((a, b) => a - b)
})

const resultLabel = computed(() => {
  const shown = filters.filteredShips.length
  const total = filters.totalShips
  return shown === total ? `${total} ships` : `${shown} of ${total} ships`
})
</script>

<template>
  <details
    class="filters"
    :open="isOpen"
    @toggle="isOpen = ($event.target as HTMLDetailsElement).open"
  >
    <summary class="filters__summary">
      <!-- Rotates with [open], so the disclosure state is visible, not inferred. -->
      <svg class="filters__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <span class="filters__summary-text">Filters</span>
      <span v-if="filters.activeCount" class="filters__count">{{ filters.activeCount }}</span>
    </summary>

    <div class="filters__body">
      <div class="filters__search">
        <label class="visually-hidden" for="ship-search">Search ships</label>
        <input
          id="ship-search"
          v-model="filters.search"
          type="search"
          class="filters__input"
          placeholder="Search by ship name"
          autocomplete="off"
        />
      </div>

      <fieldset class="filters__group">
        <legend class="filters__legend">Nation</legend>
        <div class="filters__tiles">
          <ToggleTile
            v-for="nation in catalog.nations"
            :key="nation.slug"
            :pressed="filters.nations.includes(nation.slug)"
            :label="nation.name"
            @click="filters.toggleNation(nation.slug)"
          >
            <img v-if="nation.flag" :src="nation.flag" :alt="''" class="filters__flag" />
            <span>{{ nation.name }}</span>
          </ToggleTile>
        </div>
      </fieldset>

      <fieldset class="filters__group">
        <legend class="filters__legend">Type</legend>
        <div class="filters__tiles">
          <ToggleTile
            v-for="type in catalog.types"
            :key="type.id"
            :pressed="filters.types.includes(type.id)"
            :label="type.name"
            @click="filters.toggleType(type.id)"
          >
            <img
              v-if="type.icons.normal"
              :src="type.icons.normal"
              :alt="''"
              class="filters__icon"
            />
            <span>{{ type.name }}</span>
          </ToggleTile>
        </div>
      </fieldset>

      <fieldset class="filters__group">
        <legend class="filters__legend">Tier</legend>
        <div class="filters__tiles">
          <ToggleTile
            v-for="tier in tiers"
            :key="tier"
            compact
            :pressed="filters.tiers.includes(tier)"
            :label="`Tier ${tierLabel(tier)}`"
            @click="filters.toggleTier(tier)"
          >
            {{ tierLabel(tier) }}
          </ToggleTile>
        </div>
      </fieldset>

      <div class="filters__footer">
        <!-- Two boolean filters, so two switches rather than one of each kind. -->
        <ToggleSwitch v-model="filters.premiumOnly" label="Premium only" />
        <ToggleSwitch v-model="filters.showHidden" label="Test and event hulls" />

        <p class="filters__result">{{ resultLabel }}</p>

        <button
          v-if="filters.isFiltered"
          type="button"
          class="filters__reset"
          @click="filters.reset()"
        >
          Reset
        </button>
      </div>
    </div>
  </details>
</template>

<style scoped>
.filters {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
}

.filters__summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}

.filters__summary::-webkit-details-marker {
  display: none;
}

.filters__chevron {
  flex: none;
  width: 16px;
  height: 16px;
  transform: rotate(-90deg);
  transition: transform var(--transition);
}

.filters[open] > .filters__summary .filters__chevron {
  transform: rotate(0deg);
}

.filters__count {
  min-width: 18px;
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--accent-gold);
  color: #11141a;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.filters__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 0 var(--space-4) var(--space-4);
}

.filters__input {
  width: 100%;
  max-width: 420px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  color: var(--text-primary);
  font: inherit;
}

.filters__input:focus-visible {
  border-color: var(--accent-steel);
}

.filters__group {
  margin: 0;
  padding: 0;
  border: 0;
}

.filters__legend {
  padding: 0 0 var(--space-2);
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.filters__tiles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Square box with `contain`: the API's tiny flag is a 54x54 canvas, so a 3:2 box
   squashed it. */
.filters__flag {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.filters__icon {
  width: 16px;
  height: 16px;
}

.filters__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-subtle);
}

.filters__result {
  margin: 0;
  margin-inline-start: auto;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.filters__reset {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--accent-steel-bright);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 12px;
  text-transform: uppercase;
  transition: var(--transition);
}

.filters__reset:hover {
  border-color: var(--accent-steel);
  background: color-mix(in srgb, var(--accent-steel) 20%, transparent);
}

@media (max-width: 720px) {
  .filters__result {
    margin-inline-start: 0;
  }

  /*
   * Closed, the panel sticks to the top of the viewport, so the filters are always
   * one tap away however far the list has been scrolled. Open, it takes the whole
   * screen and scrolls on its own — on a 320px viewport the panel is taller than
   * the viewport, and a full-screen sheet is the familiar shape for that.
   *
   * Both states are plain CSS on the native <details>; no JavaScript breakpoint is
   * involved.
   */
  .filters {
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .filters[open] {
    position: fixed;
    inset: 0;
    z-index: 30;
    overflow-y: auto;
    border-radius: 0;
    border-inline: 0;
  }
}
</style>
