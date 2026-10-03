<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { tierLabel } from '@/utils/roman'
import { hullVariant, typeIconFor } from '@/api/normalize'
import { hasShownArt, rememberArt } from '@/utils/art-cache'
import { SUPERSHIP_TIER } from '@/types/ship'
import type { Nation, Ship, ShipType } from '@/types/ship'

/**
 * A card is nothing but the ship's artwork.
 *
 * The artwork is 66% fully transparent, so the nation's flag sits behind it as a
 * backdrop instead of an empty panel — which is both the nation indicator and the
 * card's colour. Everything else is drawn over the image: class and tier top left,
 * the name bottom right. That removes the text rows under the image entirely, so a
 * row of cards reads as a row of ships.
 *
 * Because the information is now carried by pictures, a visually hidden line
 * repeats it as text for screen readers and for the search-result reading order.
 */
const props = withDefaults(
  defineProps<{
    ship: Ship
    nation: Nation | undefined
    type: ShipType | undefined
    /** False while the page is scrolling; see `ShipGrid`. */
    artEnabled?: boolean
  }>(),
  { artEnabled: true },
)

/**
 * The flag is the placeholder: it is one of thirteen files and is cached after the
 * first card, so it paints immediately while the ship's own artwork arrives. The
 * artwork then fades in, once.
 *
 * A spinner per card was the alternative and would have made the problem worse —
 * fifty simultaneous animations repaint every frame, which is the cost this is
 * meant to avoid.
 */
const artUrl = computed(() => props.ship.images.small || props.ship.images.medium)

/**
 * Seeded from the page-level cache, so a ship scrolled back into view shows its
 * artwork at once instead of fading in again. See `utils/art-cache.ts`.
 */
const artLoaded = ref(hasShownArt(artUrl.value))

/**
 * Artwork already shown stays on screen even while scrolling; only a ship being
 * seen for the first time waits for the scroll to settle.
 */
const showArt = computed(() => Boolean(artUrl.value) && (props.artEnabled || artLoaded.value))

function onArtSettled() {
  rememberArt(artUrl.value)
  artLoaded.value = true
}

watch(artUrl, (url) => {
  artLoaded.value = hasShownArt(url)
})

const tier = computed(() => tierLabel(props.ship.tier))
/** Decides the class icon and, from the same value, the tier numeral's colour. */
const variant = computed(() => hullVariant(props.ship))
const typeIcon = computed(() => (props.type ? typeIconFor(props.type, props.ship) : ''))

const hullClass = computed(() => {
  if (props.ship.isPremium) return 'Premium'
  if (props.ship.isSpecial) return 'Special'
  return ''
})

/** What a screen reader hears, since the card itself is only pictures. */
const description = computed(() => {
  const parts = [
    props.ship.name,
    props.type?.name ?? props.ship.type,
    props.nation?.name ?? props.ship.nation,
    props.ship.tier === SUPERSHIP_TIER ? 'supership' : `tier ${tier.value}`,
  ]
  if (hullClass.value) parts.push(hullClass.value)
  return parts.join(', ')
})
</script>

<template>
  <article
    class="card"
    :class="{ 'card--premium': ship.isPremium, 'card--special': ship.isSpecial && !ship.isPremium }"
  >
    <img
      v-if="nation?.banner"
      :src="nation.banner"
      alt=""
      class="card__flag"
      loading="lazy"
      decoding="async"
    />

    <!--
      Two sources, picked by device pixel ratio. `small` is 214x126 against
      `medium`'s 435x256 — 4.1x fewer pixels to decode for 25% more bytes, and at
      a column width of roughly 212 CSS pixels it needs no downscaling either.
      A 2x display asks for ~424 and gets `medium`.
    -->
    <img
      v-if="showArt"
      :src="artUrl"
      :srcset="`${ship.images.small} 214w, ${ship.images.medium} 435w`"
      sizes="(max-width: 640px) 45vw, 215px"
      alt=""
      class="card__ship"
      :class="{ 'card__ship--loaded': artLoaded }"
      width="214"
      height="126"
      loading="lazy"
      decoding="async"
      @load="onArtSettled"
      @error="onArtSettled"
    />

    <span class="card__scrim" aria-hidden="true"></span>

    <span class="card__class">
      <img v-if="typeIcon" :src="typeIcon" alt="" class="card__type" width="18" height="18" />
      <span class="card__tier" :class="`card__tier--${variant}`">{{ tier }}</span>
    </span>

    <span v-if="hullClass" class="card__badge">{{ hullClass }}</span>

    <h3 class="card__name">{{ ship.name }}</h3>

    <span class="visually-hidden">{{ description }}</span>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  transition: var(--transition);
  /*
   * Isolates each card's layout and paint. Without it, a row mounting during a
   * scroll invalidates layout across the whole grid, which made fast scrolling
   * stutter.
   */
  contain: content;
}

.card:hover {
  border-color: var(--border-strong);
}

.card--premium:hover {
  border-color: var(--hull-premium);
}

.card--special:hover {
  border-color: var(--hull-special);
}

/*
 * The flag fills the card and is dimmed so white text stays readable over it.
 *
 * Dimmed with `opacity`, not with a `filter`. A filter forces its own
 * rasterization pass per card, and fifty of those while scrolling was a measurable
 * part of the stutter. Opacity is handled by the compositor.
 */
.card__flag {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.46;
  transition: opacity var(--transition);
}

.card:hover .card__flag {
  opacity: 0.62;
}

/*
 * `contain`, not `cover`: the whole silhouette has to stay visible.
 *
 * No `drop-shadow` here either. A blur filter on every card is one of the most
 * expensive things to rasterize, and it was being paid for each of the ~50 cards
 * the virtualizer mounts while scrolling.
 */
.card__ship {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition:
    opacity 140ms ease-out,
    transform var(--transition);
}

.card__ship--loaded {
  opacity: 1;
}

.card:hover .card__ship {
  transform: scale(1.04);
}

/* Darkens the lower half so the name reads over any flag. */
.card__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgb(0 0 0 / 78%) 0%, rgb(0 0 0 / 20%) 42%, transparent 70%),
    linear-gradient(to bottom right, rgb(0 0 0 / 55%) 0%, transparent 38%);
}

.card__class {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.card__type {
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 90%));
}

.card__tier {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 1px 3px rgb(0 0 0 / 95%);
  font-variant-numeric: tabular-nums;
}

/* Matches the class icon beside it, which the API draws per hull variant. */
.card__tier--normal {
  color: var(--hull-mark-standard);
}

.card__tier--premium,
.card__tier--special {
  color: var(--hull-mark-premium);
}

.card__badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  /* Same centring as the dialog badge: padding alone left the text sitting high. */
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 var(--space-1);
  line-height: 1;
  border-radius: var(--radius-sm);
  background: var(--hull-premium);
  color: #11141a;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.card--special .card__badge {
  background: var(--hull-special);
}

.card__name {
  position: absolute;
  right: var(--space-2);
  bottom: var(--space-2);
  left: var(--space-5);
  color: #fff;
  font-family: var(--font-display);
  font-size: 14px;
  line-height: 1.15;
  text-align: right;
  text-shadow: 0 1px 4px rgb(0 0 0 / 95%);
  text-transform: none;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
