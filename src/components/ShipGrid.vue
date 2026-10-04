<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import ShipCard from '@/components/ShipCard.vue'
import { useElementSize } from '@/composables/useElementSize'
import type { Nation, Ship, ShipType, ShipTypeId } from '@/types/ship'

/**
 * Window-virtualized card grid.
 *
 * The whole filtered result is represented at once: the page gets its real
 * height and its real scrollbar immediately, and only the rows near the viewport
 * exist in the document — about 50 cards for a 727-ship result.
 *
 * Rows are virtualized rather than individual cards: the column count comes from
 * the measured container width, so one virtualizer covers every breakpoint and
 * the page keeps a normal scrollbar instead of a nested scroll area.
 */
const props = defineProps<{
  ships: Ship[]
  nationBySlug: Map<string, Nation>
  typeById: Map<ShipTypeId, ShipType>
}>()

const emit = defineEmits<{ select: [ship: Ship] }>()

const GAP = 12
const MIN_COLUMN_WIDTH = 200

const grid = ref<HTMLElement | null>(null)

/**
 * Width is measured on a zero-height probe, not on the grid itself.
 *
 * The grid's own height is set from this measurement, so observing the grid meant
 * the observer was watching an element it caused to resize.
 */
const widthProbe = ref<HTMLElement | null>(null)
const { width } = useElementSize(widthProbe)

const columns = computed(() => {
  if (width.value === 0) return 1
  return Math.max(1, Math.floor((width.value + GAP) / (MIN_COLUMN_WIDTH + GAP)))
})

const columnWidth = computed(() =>
  columns.value === 0 ? 0 : (width.value - GAP * (columns.value - 1)) / columns.value,
)

const rowHeight = computed(() => Math.round((columnWidth.value * 9) / 16) + GAP)

const rowCount = computed(() => Math.ceil(props.ships.length / columns.value))

/**
 * Nothing is rendered until the container has been measured.
 *
 * At width 0 the row height collapses to the gap alone, and the virtualizer caches
 * that measurement per row. Rendering only once a real width is known keeps the
 * wrong value out of the cache in the first place.
 */
const isMeasured = computed(() => width.value > 0)

/**
 * Distance from the top of the document to the grid. The window virtualizer
 * needs it to translate page scroll into row offsets.
 */
const scrollMargin = ref(0)

function measureOffset() {
  scrollMargin.value = grid.value ? grid.value.getBoundingClientRect().top + window.scrollY : 0
}

onMounted(measureOffset)
watch([width, () => props.ships.length], measureOffset, { flush: 'post' })

const virtualizer = useWindowVirtualizer(
  computed(() => ({
    count: rowCount.value,
    estimateSize: () => rowHeight.value,
    overscan: 3,
    scrollMargin: scrollMargin.value,
  })),
)

/**
 * Re-measures when the row height changes.
 *
 * `estimateSize` is read once per item and the result is cached, so a new value in
 * the options does not invalidate what was already measured. 
 */
watch(rowHeight, () => {
  virtualizer.value.measure()
})

const virtualRows = computed(() => (isMeasured.value ? virtualizer.value.getVirtualItems() : []))
// Zero until measured, so the page does not briefly claim a height computed from
// a collapsed row.
const totalSize = computed(() => (isMeasured.value ? virtualizer.value.getTotalSize() : 0))

/**
 * Artwork requests are held back while the page is actually moving.
 */
const artEnabled = computed(() => !virtualizer.value.isScrolling)

function rowShips(rowIndex: number): Ship[] {
  const start = rowIndex * columns.value
  return props.ships.slice(start, start + columns.value)
}
</script>

<template>
  <div ref="grid" class="grid" :style="{ height: `${totalSize}px` }">
    <div ref="widthProbe" class="grid__probe" aria-hidden="true"></div>

    <div
      v-for="row in virtualRows"
      :key="row.index"
      class="grid__row"
      :style="{
        transform: `translateY(${row.start - scrollMargin}px)`,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }"
    >
      <button
        v-for="ship in rowShips(row.index)"
        :key="ship.id"
        type="button"
        class="grid__cell"
        @click="emit('select', ship)"
      >
        <ShipCard
          :ship="ship"
          :nation="nationBySlug.get(ship.nation)"
          :type="typeById.get(ship.type)"
          :art-enabled="artEnabled"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.grid {
  position: relative;
  width: 100%;
}

.grid__probe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
}

.grid__row {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  gap: 12px;
  width: 100%;
  padding-bottom: 12px;
}

.grid__cell {
  display: block;
  padding: 0;
  border: 0;
  background: none;
  text-align: inherit;
  cursor: pointer;
}
</style>
