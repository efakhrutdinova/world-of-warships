/**
 * Minimal typed JSON reader over `fetch`.
 *
 * Deliberately not axios: the app makes a handful of unauthenticated GETs, and
 * the part that actually carries weight — classifying a failure into something
 * the UI can render — is app-specific code that would have to be written either
 * way. `AbortSignal.timeout()` covers the one axios feature that was missing
 * from `fetch`.
 */

export type ApiErrorKind = 'timeout' | 'network' | 'http' | 'payload'

export class ApiError extends Error {
  kind: ApiErrorKind
  status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

const DEFAULT_TIMEOUT_MS = 15_000

export async function getJson<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: 'application/json' },
    })
  } catch (cause) {
    // AbortSignal.timeout() rejects with a TimeoutError DOMException.
    const isTimeout = cause instanceof DOMException && cause.name === 'TimeoutError'
    throw new ApiError(
      isTimeout ? 'timeout' : 'network',
      isTimeout ? `Request to ${url} timed out` : `Could not reach ${url}`,
    )
  }

  if (!response.ok) {
    throw new ApiError('http', `${url} returned HTTP ${response.status}`, response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('payload', `${url} did not return valid JSON`)
  }
}
