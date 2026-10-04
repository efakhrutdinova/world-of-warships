import { afterEach, vi } from 'vitest'

/**
 * happy-dom has no ResizeObserver, which the virtualized grid measures with.
 *
 * The stub reports a plausible container width as a real one would, because the
 * grid deliberately renders nothing until it has a measurement. A no-op stub would leave every grid empty.
 */
const STUB_WIDTH = 1200

class ResizeObserverStub implements ResizeObserver {
  private callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { width: STUB_WIDTH, height: 800 } }] as never,
      this as never,
    )
  }

  unobserve() {}
  disconnect() {}
}

// Assigned unconditionally: happy-dom ships a no-op ResizeObserver that never reports
// a size, so `??=` would leave grids unmeasured and therefore unrendered.
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
