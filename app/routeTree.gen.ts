/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as UploadImport } from './routes/upload'
import { Route as StyleGuideImport } from './routes/style-guide'
import { Route as IndexImport } from './routes/index'
import { Route as BooksIndexImport } from './routes/books/index'
import { Route as BooksIdImport } from './routes/books/$id'

// Create/Update Routes

const UploadRoute = UploadImport.update({
  id: '/upload',
  path: '/upload',
  getParentRoute: () => rootRoute,
} as any)

const StyleGuideRoute = StyleGuideImport.update({
  id: '/style-guide',
  path: '/style-guide',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const BooksIndexRoute = BooksIndexImport.update({
  id: '/books/',
  path: '/books/',
  getParentRoute: () => rootRoute,
} as any)

const BooksIdRoute = BooksIdImport.update({
  id: '/books/$id',
  path: '/books/$id',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/style-guide': {
      id: '/style-guide'
      path: '/style-guide'
      fullPath: '/style-guide'
      preLoaderRoute: typeof StyleGuideImport
      parentRoute: typeof rootRoute
    }
    '/upload': {
      id: '/upload'
      path: '/upload'
      fullPath: '/upload'
      preLoaderRoute: typeof UploadImport
      parentRoute: typeof rootRoute
    }
    '/books/$id': {
      id: '/books/$id'
      path: '/books/$id'
      fullPath: '/books/$id'
      preLoaderRoute: typeof BooksIdImport
      parentRoute: typeof rootRoute
    }
    '/books/': {
      id: '/books/'
      path: '/books'
      fullPath: '/books'
      preLoaderRoute: typeof BooksIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/style-guide': typeof StyleGuideRoute
  '/upload': typeof UploadRoute
  '/books/$id': typeof BooksIdRoute
  '/books': typeof BooksIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/style-guide': typeof StyleGuideRoute
  '/upload': typeof UploadRoute
  '/books/$id': typeof BooksIdRoute
  '/books': typeof BooksIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/style-guide': typeof StyleGuideRoute
  '/upload': typeof UploadRoute
  '/books/$id': typeof BooksIdRoute
  '/books/': typeof BooksIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/style-guide' | '/upload' | '/books/$id' | '/books'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/style-guide' | '/upload' | '/books/$id' | '/books'
  id: '__root__' | '/' | '/style-guide' | '/upload' | '/books/$id' | '/books/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  StyleGuideRoute: typeof StyleGuideRoute
  UploadRoute: typeof UploadRoute
  BooksIdRoute: typeof BooksIdRoute
  BooksIndexRoute: typeof BooksIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  StyleGuideRoute: StyleGuideRoute,
  UploadRoute: UploadRoute,
  BooksIdRoute: BooksIdRoute,
  BooksIndexRoute: BooksIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/style-guide",
        "/upload",
        "/books/$id",
        "/books/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/style-guide": {
      "filePath": "style-guide.tsx"
    },
    "/upload": {
      "filePath": "upload.tsx"
    },
    "/books/$id": {
      "filePath": "books/$id.tsx"
    },
    "/books/": {
      "filePath": "books/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
