/**
 * The project is mobile-first, so this composable must ask `min-width` and nothing
 * else. Inverting it would silently flip every layout decision that depends on it.
 */
import { effectScope } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useMinWidth } from '@/composables/useMinWidth'

function stubMatchMedia(matches: boolean) {
  const seen: string[] = []
  vi.stubGlobal('matchMedia', (query: string) => {
    seen.push(query)
    return {
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }
  })
  return seen
}

describe('useMinWidth', () => {
  it('builds a min-width query from a plain number', () => {
    const queries = stubMatchMedia(true)
    const scope = effectScope()
    scope.run(() => useMinWidth(720))
    scope.stop()

    expect(queries).toEqual(['(min-width: 720px)'])
  })

  it('reports true on a wide viewport and false on a narrow one', () => {
    stubMatchMedia(true)
    const wide = effectScope()
    let result = wide.run(() => useMinWidth(720))!
    expect(result.matches.value).toBe(true)
    wide.stop()

    stubMatchMedia(false)
    const narrow = effectScope()
    result = narrow.run(() => useMinWidth(720))!
    expect(result.matches.value).toBe(false)
    narrow.stop()
  })

  it('reports false when the environment has no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    const scope = effectScope()
    const result = scope.run(() => useMinWidth(720))!
    expect(result.matches.value).toBe(false)
    scope.stop()
  })
})
