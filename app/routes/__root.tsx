import './__root.css'
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
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
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
