# World of Warships — ship catalogue

A single page listing every ship in World of Warships, filterable by nation,
class and tier, styled after the World of Warships portal.

Built with Vue 3, TypeScript and Vite.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

That is the whole setup. No API key, no second process, no environment file.

```bash
npm run build        # type-check and bundle into dist/
npm run preview      # serve dist/ (the data proxy runs here too)
npm run test         # 128 tests
npm run lint         # ESLint
npm run typecheck    # vue-tsc
npm run fetch:data   # refresh the committed data snapshot
```

## Where the data comes from

The four vortex encyclopedia endpoints named in the assignment, read through a
small proxy that Vite runs in development and in `preview`:

```
GET /api/catalog               ships, nations, types
GET /api/catalog/details/:id   one ship's description and artwork
```

The proxy exists for two measured reasons.

**vortex sends no CORS headers.** No `Access-Control-Allow-Origin` on any
endpoint, so a browser cannot call it directly from any origin.

**`/vehicles/` is 19,889,418 bytes and ignores `Accept-Encoding: gzip`** — every
record carries localization for 19 languages. The proxy resolves one locale,
drops unused icon variants, splits off the parts only the details dialog needs,
and gzips what is left:

|                              | bytes      |
| ---------------------------- | ---------- |
| vortex `/vehicles/`, as sent | 19,889,418 |
| list payload, gzipped        | 161,211    |
| one ship's details, on open  | 404        |

That is a 123× reduction on the request that blocks first paint. The grid then
virtualizes the result: about 50 cards exist in the document however far you
scroll, while the page keeps the full height and a stable scrollbar.

If vortex is unreachable the app falls back to `public/data/catalog.en.json`, a
snapshot committed to this repository, and says so in the page.

That fallback is also what a static deployment runs on. The proxy is a Vite plugin, so
`/api/catalog` exists under `npm run dev` and `npm run preview` and nowhere else: a
`dist/` served by any static host works, on snapshot data, with the stale-data notice
showing. Live data in production needs the proxy ported to the host's runtime, or the
snapshot regenerated on a schedule — `ARCHITECTURE.md` section 7 covers both. The
browser cannot call vortex directly in any case, because vortex sends no CORS headers.

## What is where

```
src/
  api/          vortex transport, snapshot fallback, normalization
  components/   cards, grid, filters, dialog; ui/ holds the shared primitives
  composables/  debounce, element size, URL synchronization
  stores/       catalog and filters (Pinia)
  views/        ShipsView
  types/        API shapes and the domain model, kept apart
build/          the dev/preview proxy — a stand-in for a BFF
scripts/        snapshot generator
test/           128 tests, fixtures sliced from a real vortex response
```

`ARCHITECTURE.md` explains how the pieces fit and why each decision was made.

## Dependencies

Four at runtime: `vue`, `vue-router`, `pinia`, `@tanstack/vue-virtual`.

Each is either an official part of the framework or a non-trivial algorithm.
Everything else is the platform: the details dialog is a native `<dialog>`,
images use native `loading="lazy"`, requests use `fetch` with
`AbortSignal.timeout()`, responsive layout is plain CSS. Debounce and
`ResizeObserver` are two short composables rather than a utility library.

The reasoning for each inclusion and each omission is in `ARCHITECTURE.md`.
