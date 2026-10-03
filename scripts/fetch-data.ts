/**
 * Writes the catalogue snapshot to `public/data/`.
 *
 * The snapshot is committed so that `npm run build` produces a `dist/` that
 * works on any static host, where no proxy exists to reach vortex. At runtime
 * the app prefers live data and falls back to these files, which also makes the
 * degraded path easy to demonstrate.
 *
 * Usage: npm run fetch:data [-- --locale=en]
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fetchFullBundle } from '../build/vortex-source.ts'

const localeArg = process.argv.find((arg) => arg.startsWith('--locale='))
const locale = localeArg?.split('=')[1] ?? 'en'
const outputDir = resolve(import.meta.dirname, '../public/data')

const { details, ...list } = await fetchFullBundle(locale)
await mkdir(outputDir, { recursive: true })

const files: Array<[string, unknown]> = [
  [`catalog.${locale}.json`, list],
  [`details.${locale}.json`, details],
]

for (const [name, payload] of files) {
  const body = JSON.stringify(payload)
  await writeFile(resolve(outputDir, name), body)
  console.log(`wrote public/data/${name} (${Math.round(Buffer.byteLength(body) / 1024)} KB)`)
}

console.log(
  `${Object.keys(list.vehicles).length} ships, ${list.nations.length} nations, ` +
    `${Object.keys(list.types).length} types`,
)
