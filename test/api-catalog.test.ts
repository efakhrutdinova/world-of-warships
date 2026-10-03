/**
 * The fallback path is what the task's "if the vortex service is unavailable"
 * criterion comes down to, so it is asserted as behaviour, not documented only.
 */
import { describe, expect, it, vi } from 'vitest'
import { loadCatalog, loadShipDetail, loadSnapshotDetails } from '@/api/catalog'
import { catalogFixture } from './fixtures/catalog'

function respondBy(routes: Record<string, () => Response>) {
  return vi.fn((input: string | URL) => {
    const url = String(input)
    const match = Object.keys(routes).find((prefix) => url.startsWith(prefix))
    if (!match) return Promise.resolve(new Response('', { status: 404 }))
    return Promise.resolve(routes[match]())
  })
}

const ok = (body: unknown) => () => new Response(JSON.stringify(body), { status: 200 })
const down = () => new Response('', { status: 503 })

describe('loadCatalog', () => {
  it('uses live data when the proxy answers', async () => {
    vi.stubGlobal('fetch', respondBy({ '/api/catalog': ok(catalogFixture) }))
    const result = await loadCatalog('en')
    expect(result.origin).toBe('live')
    expect(Object.keys(result.bundle.vehicles).length).toBeGreaterThan(0)
  })

  it('falls back to the committed snapshot when the proxy fails', async () => {
    vi.stubGlobal(
      'fetch',
      respondBy({ '/api/catalog': down, '/data/catalog.en.json': ok(catalogFixture) }),
    )
    const result = await loadCatalog('en')
    expect(result.origin).toBe('snapshot')
  })

  it('reports the live failure, not the snapshot one, when both are gone', async () => {
    vi.stubGlobal('fetch', respondBy({ '/api/catalog': down, '/data/catalog.en.json': down }))
    await expect(loadCatalog('en')).rejects.toMatchObject({ kind: 'http', status: 503 })
  })
})

describe('loadShipDetail', () => {
  it('asks the proxy for one ship, not the whole details map', async () => {
    const fetchMock = respondBy({
      '/api/catalog/details/42': ok({ description: 'one ship', large: '' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(loadShipDetail('en', 42)).resolves.toMatchObject({ description: 'one ship' })
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/catalog/details/42?locale=en')
  })

  it('surfaces a failure, so the caller can degrade', async () => {
    vi.stubGlobal('fetch', respondBy({ '/api/catalog/details/42': down }))
    await expect(loadShipDetail('en', 42)).rejects.toMatchObject({ kind: 'http' })
  })
})

describe('loadSnapshotDetails', () => {
  it('reads the static file, which cannot be sliced per ship', async () => {
    const fetchMock = respondBy({
      '/data/details.en.json': ok({ '42': { description: 'from snapshot', large: '' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(loadSnapshotDetails('en')).resolves.toMatchObject({
      '42': { description: 'from snapshot' },
    })
  })
})
