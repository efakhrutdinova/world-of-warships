/**
 * End-to-end smoke test in place of a manual browser pass: boots the real app
 * shell with the real router and stores, and fails if anything reaches
 * `console.error` — the task's "no console errors" requirement, checked
 * automatically.
 */
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App.vue'
import ShipsView from '@/views/ShipsView.vue'
import { catalogFixture } from './fixtures/catalog'

function stubFetch(available: boolean) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const url = String(input)
      if (url.startsWith('/api/catalog/details/')) {
        return Promise.resolve(
          new Response(JSON.stringify({ description: 'A ship.', large: '' }), { status: 200 }),
        )
      }
      if (url.includes('data/details.')) {
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))
      }
      if (url.startsWith('/api/catalog')) {
        return Promise.resolve(
          available
            ? new Response(JSON.stringify(catalogFixture), { status: 200 })
            : new Response('', { status: 503 }),
        )
      }
      if (url.includes('data/catalog.')) {
        return Promise.resolve(new Response(JSON.stringify(catalogFixture), { status: 200 }))
      }
      return Promise.resolve(new Response('', { status: 404 }))
    }),
  )
}

function boot() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'ships', component: ShipsView }],
  })
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const wrapper = mount(App, { global: { plugins: [router, createPinia()] } })
  return { router, wrapper, consoleError }
}

describe('application smoke test', () => {
  it('renders the catalogue and logs nothing to the console', async () => {
    stubFetch(true)
    const { router, wrapper, consoleError } = boot()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain('Ships')
    expect(wrapper.findAll('article').length).toBeGreaterThan(0)
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('shows the stale-data notice instead of an empty page when vortex is down', async () => {
    stubFetch(false)
    const { router, wrapper, consoleError } = boot()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain('encyclopedia service is unavailable')
    expect(wrapper.findAll('article').length).toBeGreaterThan(0)
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('opens a ship dialog over the list, without navigating', async () => {
    stubFetch(true)
    const { router, wrapper, consoleError } = boot()
    await router.isReady()
    await flushPromises()

    const before = router.currentRoute.value.fullPath
    await wrapper.find('.grid__cell').trigger('click')
    await flushPromises()

    expect(wrapper.find('dialog').attributes('aria-label')).not.toBe('Ship details')
    expect(router.currentRoute.value.fullPath).toBe(before)
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('requests details for the opened ship only', async () => {
    stubFetch(true)
    const { router, wrapper, consoleError } = boot()
    await router.isReady()
    await flushPromises()

    await wrapper.find('.grid__cell').trigger('click')
    await flushPromises()

    const detailCalls = (fetch as unknown as { mock: { calls: [string][] } }).mock.calls.filter(
      ([url]) => String(url).includes('details'),
    )
    expect(detailCalls).toHaveLength(1)
    expect(String(detailCalls[0][0])).toMatch(/\/api\/catalog\/details\/\d+/)
    expect(consoleError).not.toHaveBeenCalled()
  })
})
