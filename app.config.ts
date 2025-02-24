import { defineConfig } from '@tanstack/start/config'
import vite from './vite.config'

export default defineConfig({
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
