import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Merged rather than redeclared, so aliases and plugins cannot drift apart
// between the app build and the test run.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./test/setup.ts'],
      include: ['test/**/*.test.ts'],
      // CSS is not processed by default, which makes even a `?raw` import resolve
      // to an empty string. The palette test reads tokens.css as text, so that one
      // file is opted in rather than enabling CSS handling for the whole suite.
      css: { include: [/tokens\.css/] },
    },
  }),
)
