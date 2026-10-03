/**
 * The URL is the shareable form of a filtered view, so both directions are
 * asserted: a pasted link must apply filters, and changing a filter must update
 * the link without pushing history entries.
 */
import { defineComponent, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFilterQuerySync } from '@/composables/useFilterQuerySync'
import { useFiltersStore } from '@/stores/filters'

const Host = defineComponent({
  setup() {
    useFilterQuerySync()
    return () => null
  },
})

/** Lets the filter watcher run and the resulting router navigation finish. */
async function settle() {
  await nextTick()
  await flushPromises()
}

async function mountAt(router: Router, pinia: Pinia, path: string) {
  await router.push(path)
  await router.isReady()
  return mount(Host, { global: { plugins: [router, pinia] } })
}

describe('useFilterQuerySync', () => {
  let router: Router
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'ships', component: Host }],
    })
  })

  it('applies every filter encoded in the query', async () => {
    await mountAt(
      router,
      pinia,
      '/?q=tashkent&nation=usa,germany&type=Destroyer&tier=9,10&hidden=1',
    )
    const filters = useFiltersStore()

    expect(filters.search).toBe('tashkent')
    expect(filters.nations).toEqual(['usa', 'germany'])
    expect(filters.types).toEqual(['Destroyer'])
    expect(filters.tiers).toEqual([9, 10])
    expect(filters.showHidden).toBe(true)
  })

  it('round-trips the premium toggle through the query', async () => {
    await mountAt(router, pinia, '/?premium=1')
    const filters = useFiltersStore()
    expect(filters.premiumOnly).toBe(true)

    filters.premiumOnly = false
    await settle()
    expect(router.currentRoute.value.query).toEqual({})

    filters.premiumOnly = true
    await settle()
    expect(router.currentRoute.value.query).toMatchObject({ premium: '1' })
  })

  it('ignores values the domain does not accept', async () => {
    await mountAt(router, pinia, '/?type=Dreadnought&tier=0,12,abc')
    const filters = useFiltersStore()

    expect(filters.types).toEqual([])
    expect(filters.tiers).toEqual([])
  })

  it('writes filter changes back to the query', async () => {
    await mountAt(router, pinia, '/')
    const filters = useFiltersStore()

    filters.toggleNation('japan')
    filters.toggleTier(7)
    await settle()

    expect(router.currentRoute.value.query).toMatchObject({ nation: 'japan', tier: '7' })
  })

  it('replaces rather than pushes, so filtering does not fill the history', async () => {
    await mountAt(router, pinia, '/')
    const lengthBefore = window.history.length
    const filters = useFiltersStore()

    filters.toggleNation('japan')
    await settle()

    expect(window.history.length).toBe(lengthBefore)
  })

  it('follows a backwards navigation, so the filters match the restored URL', async () => {
    await mountAt(router, pinia, '/')
    const filters = useFiltersStore()

    await router.push('/?nation=italy')
    await settle()
    expect(filters.nations).toEqual(['italy'])

    await router.push('/?nation=spain')
    await settle()
    expect(filters.nations).toEqual(['spain'])
  })

  it('leaves the query clean when no filter is active', async () => {
    await mountAt(router, pinia, '/?nation=italy')
    const filters = useFiltersStore()

    filters.reset()
    await settle()

    expect(router.currentRoute.value.query).toEqual({})
  })
})
