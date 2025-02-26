import { defineConfig } from '@tanstack/start/config'
import vite from './vite.config'

const config = await defineConfig({
  vite,
  server: {
    esbuild: {
      options: {
        supported: {
          'top-level-await': true,
        },
      },
    },
  },
  tsr: {
    routeFileIgnorePattern: '\\.test\\.tsx?',
  },
})

console.dir(config, { depth: null })

export default config
