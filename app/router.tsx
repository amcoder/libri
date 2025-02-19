import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { LibriApi } from './lib/api'

const api = await createLibriApi()

export function createRouter() {
  const queryClient = new QueryClient()

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient, api },
      scrollRestoration: true,
    }),
    queryClient,
  )
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}

async function createLibriApi(): Promise<LibriApi> {
  if (import.meta.env.SSR) {
    return await import('./lib/api/api-database')
  } else {
    return await import('./lib/api/api-web')
  }
}
