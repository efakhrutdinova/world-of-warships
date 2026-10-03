import { describe, expect, it, vi } from 'vitest'
import { ApiError, getJson } from '@/api/client'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, ...init })
}

describe('getJson', () => {
  it('returns the parsed body on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ok: true })))
    await expect(getJson<{ ok: boolean }>('/x')).resolves.toEqual({ ok: true })
  })

  it('classifies a non-2xx response as an http error and keeps the status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 502 })))
    const error = await getJson('/x').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('http')
    expect((error as ApiError).status).toBe(502)
  })

  it('classifies unparseable JSON separately from a transport failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', { status: 200 })))
    await expect(getJson('/x')).rejects.toMatchObject({ kind: 'payload' })
  })

  it('reports a dropped connection as a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(getJson('/x')).rejects.toMatchObject({ kind: 'network' })
  })

  it('reports an expired timeout signal as a timeout', async () => {
    const timeout = new DOMException('The operation timed out', 'TimeoutError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout))
    await expect(getJson('/x', 5)).rejects.toMatchObject({ kind: 'timeout' })
  })
})
