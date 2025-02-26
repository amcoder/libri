import {
  eventHandler,
  createRouter,
  createError,
  Router,
  H3Error,
  setResponseStatus,
} from 'h3'
import { createLibriService } from './lib/service'
import { ApiFileRoute } from '~/lib/routing'
import vinxiFileRoutes from 'vinxi/routes'

// This is the interface for the objects that vinxi uses to represent API
// routes discovered in the file system.
// TODO: I believe this is configured by tanstack. Find out how to change this config.
interface VinxiApiFileRoute {
  path: string
  filePath: string
  $APIRoute?: {
    src: string
    import: () => Promise<{
      APIRoute: ApiFileRoute<unknown>
    }>
  }
}

// Convert a vinxi path to an h3 path
function toH3Path(path: string) {
  return (
    '/' +
    path
      .split('/')
      .map((p) => {
        if (p === 'api') return ''
        if (p === '*splat') return '*'
        if (p.startsWith(':$') && p.endsWith('?')) return `:${p.slice(2, -1)}`
        return p
      })
      .filter(Boolean)
      .join('/')
  )
}

// Convert the list of API routes to an h3 router
async function toH3Router(routes: VinxiApiFileRoute[]): Promise<Router> {
  return (
    await Promise.all(
      routes.map(async (route) => {
        const path = toH3Path(route.path)

        const apiRoute = (await route.$APIRoute?.import())?.APIRoute
        if (!apiRoute) {
          return []
        }

        return Object.entries(apiRoute).map(([method, handler]) => ({
          path,
          method,
          handler,
        }))
      }),
    )
  )
    .flat()
    .toSorted((a, b) => b.path.localeCompare(a.path))
    .reduce(
      (router, { method, path, handler }) => router[method](path, handler),
      createRouter(),
    )
}

async function createH3Router() {
  // Get the list of API routes discovered by vinxi
  const apiRoutes = (
    vinxiFileRoutes as unknown[] as Array<VinxiApiFileRoute>
  ).filter((route) => route['$APIRoute'])

  const router = await toH3Router(apiRoutes)
  router.use(
    '/**',
    eventHandler(() => {
      throw createError({ status: 404, message: 'Not found' })
    }),
  )
  return router
}

const service = await createLibriService()

let router: Router
export default eventHandler(async (event) => {
  try {
    if (!router) {
      router = await createH3Router()
    }

    event.context.service = service
    return await router.handler(event)
  } catch (error) {
    if (error instanceof H3Error) {
      setResponseStatus(event, error.statusCode)
      return error.cause
    } else {
      console.error(error)
      setResponseStatus(event, 500)
      return { status: 500, message: 'Internal Server Error' }
    }
  }
})
