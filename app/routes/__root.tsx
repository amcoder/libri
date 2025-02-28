import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { LibriService } from '~/lib/service'
import { Header } from '~/components/header'
import { Navigation } from '~/components/navigation'
import { ServiceContext } from '~/components/service-context'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  service: LibriService
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Libri',
      },
    ],
    links: [{ rel: 'stylesheet', href: '/app.css' }],
  }),
  component: RootComponent,
})

function RootComponent() {
  const service = Route.useRouteContext().service
  return (
    <ServiceContext.Provider value={service}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ServiceContext.Provider>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <div id='main-container'>
          <Navigation />
          <main>{children}</main>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
