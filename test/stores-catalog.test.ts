import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCatalogStore } from '@/stores/catalog'
import { catalogFixture } from './fixtures/catalog'

const detailsFixture = { '1': { description: 'A ship.', large: 'vehicle/large/a.png' } }

function stubRoutes(options: { live?: boolean; snapshot?: boolean; details?: boolean } = {}) {
  const { live = true, snapshot = true, details = true } = options
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const url = String(input)
      if (url.startsWith('/api/catalog/details/')) {
        const id = url.split('/').pop()?.split('?')[0] ?? ''
        const detail = detailsFixture[id as keyof typeof detailsFixture]
        return Promise.resolve(
          details && detail
            ? new Response(JSON.stringify(detail), { status: 200 })
            : new Response('', { status: 500 }),
        )
      }
      if (url.startsWith('/api/catalog')) {
        return Promise.resolve(
          live
            ? new Response(JSON.stringify(catalogFixture), { status: 200 })
            : new Response('', { status: 503 }),
        )
      }
      if (url.includes('data/details.')) {
        return Promise.resolve(
          details
            ? new Response(JSON.stringify(detailsFixture), { status: 200 })
            : new Response('', { status: 404 }),
        )
      }
      if (url.includes('data/catalog.')) {
        return Promise.resolve(
          snapshot
            ? new Response(JSON.stringify(catalogFixture), { status: 200 })
            : new Response('', { status: 404 }),
        )
      }
      return Promise.resolve(new Response('', { status: 404 }))
    }),
  )
}

describe('catalog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes normalized ships after a successful load', async () => {
    stubRoutes()
    const store = useCatalogStore()
    await store.load()

    expect(store.isReady).toBe(true)
    expect(store.isStale).toBe(false)
    expect(store.error).toBeNull()
    expect(store.ships.length).toBeGreaterThan(0)
    expect(store.nations.length).toBe(13)
    expect(store.types.length).toBe(5)
  })

  it('marks the catalogue stale when it came from the snapshot', async () => {
    stubRoutes({ live: false })
    const store = useCatalogStore()
    await store.load()

    expect(store.isStale).toBe(true)
    expect(store.isReady).toBe(true)
    expect(store.error).toBeNull()
  })

  it('reports a readable message when nothing can be loaded', async () => {
    stubRoutes({ live: false, snapshot: false })
    const store = useCatalogStore()
    await store.load()

    expect(store.isReady).toBe(false)
    expect(store.error).toMatch(/encyclopedia service replied with an error/i)
  })

  it('collapses concurrent loads into a single request', async () => {
    stubRoutes()
    const store = useCatalogStore()
    await Promise.all([store.load(), store.load(), store.load()])

    const calls = (fetch as unknown as { mock: { calls: unknown[] } }).mock.calls
    expect(calls).toHaveLength(1)
  })

  it('fetches details for one ship only, and only once', async () => {
    stubRoutes()
    const store = useCatalogStore()
    await store.load()
    const id = Number(Object.keys(detailsFixture)[0])

    await store.ensureDetail(id)
    await store.ensureDetail(id)

    expect(store.details[id]).toMatchObject(detailsFixture[String(id) as '1'])

    const detailCalls = (fetch as unknown as { mock: { calls: [string][] } }).mock.calls.filter(
      ([url]) => String(url).includes('details'),
    )
    expect(detailCalls).toHaveLength(1)
    expect(String(detailCalls[0][0])).toContain(`/api/catalog/details/${id}`)
  })

  it('reads the whole details file once when running off the snapshot', async () => {
    stubRoutes({ live: false })
    const store = useCatalogStore()
    await store.load()
    const id = Number(Object.keys(detailsFixture)[0])

    await store.ensureDetail(id)
    await store.ensureDetail(id + 1)

    const detailCalls = (fetch as unknown as { mock: { calls: [string][] } }).mock.calls.filter(
      ([url]) => String(url).includes('details'),
    )
    expect(detailCalls).toHaveLength(1)
    expect(store.details[id]).toBeDefined()
  })

  it('keeps working when the details request fails', async () => {
    stubRoutes({ details: false })
    const store = useCatalogStore()
    await store.load()
    await store.ensureDetail(1)

    expect(store.details).toEqual({})
    expect(store.error).toBeNull()
  })

  it('finds a ship by id', async () => {
    stubRoutes()
    const store = useCatalogStore()
    await store.load()

    const first = store.ships[0]
    expect(store.shipById(first.id)).toEqual(first)
    expect(store.shipById(-1)).toBeNull()
  })
})
