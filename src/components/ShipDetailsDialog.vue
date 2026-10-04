<script setup lang="ts">
import { computed, watch } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import { hullVariant, resolveIconUrl, typeIconFor } from '@/api/normalize'
import { tierLabel } from '@/utils/roman'
import { useCatalogStore } from '@/stores/catalog'
import { SUPERSHIP_TIER, type Ship } from '@/types/ship'
import seaSkyDay from '@/assets/sea-sky-day.webp'

/**
 * Ship details, opened over the list as local state rather than as a route.
 *
 * Descriptions and full-size artwork are not part of the list payload, so opening
 * a ship asks the store for that one ship's details. The dialog stays usable if
 * the request fails: everything else is already in memory.
 */
const props = defineProps<{ ship: Ship | null }>()
const emit = defineEmits<{ close: [] }>()

const catalog = useCatalogStore()

const nation = computed(() =>
  catalog.nations.find((candidate) => candidate.slug === props.ship?.nation),
)
const type = computed(() => catalog.types.find((candidate) => candidate.id === props.ship?.type))
const detail = computed(() => (props.ship ? catalog.details[props.ship.id] : null))

const artwork = computed(() => {
  if (detail.value?.large)
    return resolveIconUrl(catalog.catalog?.mediaPath ?? '', detail.value.large)
  return props.ship?.images.medium ?? ''
})

const typeIcon = computed(() =>
  type.value && props.ship ? typeIconFor(type.value, props.ship) : '',
)

const tier = computed(() => (props.ship ? tierLabel(props.ship.tier) : ''))
/** Same source of truth as the card, so the tier matches its class icon here too. */
const variant = computed(() => (props.ship ? hullVariant(props.ship) : 'normal'))
const hullBadge = computed(() => {
  if (props.ship?.isPremium) return 'Premium'
  if (props.ship?.isSpecial) return 'Special'
  return ''
})

const facts = computed(() => {
  const current = props.ship
  if (!current) return []
  return [
    { label: 'Nation', value: nation.value?.name ?? current.nation },
    { label: 'Type', value: type.value?.name ?? current.type },
    {
      label: 'Tier',
      value: current.tier === SUPERSHIP_TIER ? 'Supership' : tierLabel(current.tier),
    },
    {
      label: 'Class',
      value: current.isPremium ? 'Premium' : current.isSpecial ? 'Special' : 'Tech tree',
    },
  ]
})

watch(
  () => props.ship,
  (current) => {
    if (current) void catalog.ensureDetail(current.id)
  },
  { immediate: true },
)
</script>

<template>
  <AppModal :open="ship !== null" :label="ship?.name ?? 'Ship details'" @close="emit('close')">
    <div v-if="ship" class="details">
      <div class="details__art">
        <img :src="seaSkyDay" alt="" class="details__sky" loading="lazy" decoding="async" />
        <img v-if="artwork" :src="artwork" :alt="ship.name" class="details__image" />
        <!-- Flag, tier, class, name — one row -->
        <div class="details__heading">
          <img v-if="nation?.flag" :src="nation.flag" alt="" class="details__flag" />
          <span class="details__tier" :class="`details__tier--${variant}`">{{ tier }}</span>
          <img v-if="typeIcon" :src="typeIcon" alt="" class="details__type" />
          <h2 class="details__name">{{ ship.name }}</h2>
        </div>

        <span v-if="hullBadge" class="details__badge" :class="`details__badge--${variant}`">
          {{ hullBadge }}
        </span>
      </div>

      <dl class="details__facts">
        <div v-for="fact in facts" :key="fact.label" class="details__fact">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>

      <p v-if="detail?.description" class="details__description">{{ detail.description }}</p>
      <p v-else class="details__description details__description--muted">
        No description available for this ship.
      </p>
    </div>

    <p v-else class="details__missing">This ship is not in the catalogue.</p>
  </AppModal>
</template>

<style scoped>
.details {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.details__art {
  position: relative;
  flex: 1 1 auto;
  min-height: 180px;
  background: var(--surface-sunken);
}

.details__sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details__image {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.details__heading {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-5) var(--space-4) var(--space-3);
  background: linear-gradient(to top, rgb(0 0 0 / 85%), transparent);
}

.details__flag {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.details__tier {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 4px rgb(0 0 0 / 95%);
}

.details__tier--normal {
  color: var(--hull-mark-standard);
}

.details__tier--premium,
.details__tier--special {
  color: var(--hull-mark-premium);
}

.details__type {
  width: 26px;
  height: 26px;
}

.details__name {
  font-size: 20px;
  line-height: 1.2;
}

.details__badge {
  position: absolute;
  top: var(--space-3);
  /* Clear of the close button: its 32px plus a gap on either side. */
  right: calc(32px + var(--space-2) * 2);
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 var(--space-2);
  line-height: 1;
  border-radius: var(--radius-sm);
  background: var(--hull-premium);
  color: #11141a;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.details__badge--special {
  background: var(--hull-special);
}

.details__facts {
  display: grid;
  flex: none;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

@media (min-width: 720px) {
  .details__art {
    flex: none;
  }

  .details__image {
    height: auto;
    max-height: 46dvh;
    aspect-ratio: 16 / 9;
  }

  .details__facts {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    grid-auto-flow: row;
    gap: var(--space-3);
  }

  .details__fact dd {
    font-size: 15px;
  }

  .details__description {
    flex: 1;
    max-height: none;
    font-size: 14px;
  }
}

.details__fact dt {
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.details__fact dd {
  margin: var(--space-1) 0 0;
  font-size: 13px;
}

.details__description {
  flex: 0 1 auto;
  max-height: 42dvh;
  min-height: 0;
  margin: 0;
  padding: var(--space-4);
  overflow-y: auto;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.65;
}

.details__description--muted {
  color: var(--text-muted);
  font-style: italic;
}

.details__missing {
  padding: var(--space-6);
  text-align: center;
  color: var(--text-secondary);
}
</style>
