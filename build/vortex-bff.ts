/**
 * Dev/preview stand-in for a backend-for-frontend endpoint.
 *
 * Routes:
 *   GET /api/catalog?locale=xx               list payload (ships, nations, types)
 *   GET /api/catalog/details/:id?locale=xx   one ship's description and artwork
 *   GET /api/catalog/details?locale=xx       the whole map, for snapshot parity
 *
 * One upstream read fills all three: the reader produces a full bundle and the
 * handler serves slices of it. Responses are cached in memory and gzipped, since
 * vortex itself sends neither caching headers nor compression.
 *
 * Registered on the dev server and on `vite preview`, so a production build can
 * be reviewed without starting a second process.
 */
import { gzipSync } from 'node:zlib'
import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite'
import { fetchFullBundle } from './vortex-source.ts'
import type { FullBundle } from '../src/types/vortex.ts'

const CACHE_TTL_MS = 30 * 60 * 1000
const DEFAULT_LOCALE = 'en'
const LIST_ROUTE = '/api/catalog'
const DETAILS_ROUTE = '/api/catalog/details'

interface CacheEntry {
  bundle: FullBundle
  storedAt: number
}

const cache = new Map<string, CacheEntry>()
/** Collapses concurrent requests for the same locale into one upstream read. */
const inFlight = new Map<string, Promise<FullBundle>>()

function loadBundle(locale: string): Promise<FullBundle> {
  const cached = cache.get(locale)
  if (cached && Date.now() - cached.storedAt < CACHE_TTL_MS) {
    return Promise.resolve(cached.bundle)
  }

  const pending = inFlight.get(locale)
  if (pending) return pending

  const request = fetchFullBundle(locale)
    .then((bundle) => {
      cache.set(locale, { bundle, storedAt: Date.now() })
      return bundle
    })
    .finally(() => {
      inFlight.delete(locale)
    })

  inFlight.set(locale, request)
  return request
}

function sendJson(
  req: Connect.IncomingMessage,
  res: Parameters<Connect.NextHandleFunction>[1],
  status: number,
  payload: unknown,
) {
  const body = Buffer.from(JSON.stringify(payload))
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'public, max-age=1800')

  if (/\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
    const compressed = gzipSync(body)
    res.setHeader('content-encoding', 'gzip')
    res.setHeader('content-length', String(compressed.length))
    res.end(compressed)
    return
  }

  res.setHeader('content-length', String(body.length))
  res.end(body)
}

/** The list payload is the bundle minus the lazily fetched details. */
function listPayloadOf(bundle: FullBundle) {
  const { details, ...list } = bundle
  void details
  return list
}

const handler: Connect.NextHandleFunction = (req, res, next) => {
  const url = req.url ?? ''
  const path = url.split('?')[0]

  const isList = path === LIST_ROUTE
  const isAllDetails = path === DETAILS_ROUTE
  const shipId = path.startsWith(`${DETAILS_ROUTE}/`) ? path.slice(DETAILS_ROUTE.length + 1) : ''

  if (!isList && !isAllDetails && !shipId) {
    next()
    return
  }

  const locale =
    new URLSearchParams(url.slice(url.indexOf('?') + 1)).get('locale') ?? DEFAULT_LOCALE

  loadBundle(locale)
    .then((bundle) => {
      if (shipId) {
        const detail = bundle.details[shipId]
        if (!detail) {
          sendJson(req, res, 404, { error: `unknown ship ${shipId}` })
          return
        }
        sendJson(req, res, 200, detail)
        return
      }
      if (isAllDetails) {
        sendJson(req, res, 200, bundle.details)
        return
      }
      sendJson(req, res, 200, listPayloadOf(bundle))
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'unknown upstream failure'
      sendJson(req, res, 502, { error: message })
    })
}

export function vortexBff(): Plugin {
  return {
    name: 'vortex-bff',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(handler)
    },
  }
}
