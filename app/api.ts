import {
  defineEventHandler,
  createRouter,
  createError,
  Router,
  H3Error,
  setResponseStatus,
} from 'h3'
import { createLibriApi } from '~/lib/api'
import { ApiFileRoute } from '~/lib/routing'
import vinxiFileRoutes from 'vinxi/routes'

interface VinxiApiFileRoute {
  path: string // this path adheres to the h3 router path format
  filePath: string // this is the file path on the system
  $APIRoute?: {
    src: string // this is the path to the source file
    import: () => Promise<{
      APIRoute: ApiFileRoute
    }>
  }
}

const apiRoutes = (
  vinxiFileRoutes as unknown[] as Array<VinxiApiFileRoute>
).filter((route) => route['$APIRoute'])

async function toH3Router(routes: VinxiApiFileRoute[]): Promise<Router> {
  const h3Routes = (
    await Promise.all(
      routes.map(async (route) => {
        const path =
          '/' +
          route.path
            .split('/')
            .map((p) => {
              if (p === 'api') return ''
              if (p === '*splat') return '*'
              if (p.startsWith(':$') && p.endsWith('?'))
                return `:${p.slice(2, -1)}`
              return p
            })
            .filter(Boolean)
            .join('/')

        const apiRoute = (await route.$APIRoute?.import())?.APIRoute
        if (!apiRoute) {
          return []
        }

        return Object.entries(apiRoute).map(([method, handler]) => {
          return {
            path,
            method,
            handler,
          }
        })
      }),
    )
  ).flat()

  h3Routes.sort((a, b) => b.path.localeCompare(a.path))

  return h3Routes.reduce((router, route) => {
    console.log('adding route', route)
    return router[route.method](route.path, route.handler)
  }, createRouter())
}

let router: Router
export default defineEventHandler(async (event) => {
  try {
    if (!router) {
      router = await toH3Router(apiRoutes)
      router.use(
        '/**',
        defineEventHandler(() => {
          throw createError({ status: 404, message: 'Not found' })
        }),
      )
    }

    event.context.api = await createLibriApi()
    return await router.handler(event)
  } catch (error) {
    if (error instanceof H3Error) {
      setResponseStatus(event, 404)
      return error.cause
    } else {
      setResponseStatus(event, 500)
      return { status: 500, message: 'Internal Server Error' }
    }
  }
})
