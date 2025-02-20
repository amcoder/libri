import './__root.css'
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { LibriApi } from '~/lib/api'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  api: LibriApi
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
        <header id='main-header'>
          <h1>Libri</h1>
          <form>
            <input type='text' placeholder='Search' />
          </form>
          <menu>
            <li>
              <a href='#'>User</a>
            </li>
            <li>
              <a href='#'>Settings</a>
            </li>
            <li>
              <a href='#'>Help</a>
            </li>
          </menu>
        </header>
        <div id='main-container'>
          <nav>
            <menu>
              <li>
                <Link to='/books'>Books</Link>
              </li>
              <li>
                <Link to='/books/$id' params={{ id: '1' }}>
                  Book 1
                </Link>
              </li>
              <li>
                <Link to='/books/$id' params={{ id: '2' }}>
                  Book 2
                </Link>
              </li>
              <li>
                <a href='#'>Contact</a>
              </li>
              <li>
                <a href='#'>About</a>
              </li>
            </menu>
          </nav>
          <main>{children}</main>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
