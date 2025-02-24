import { eventHandler } from 'h3'

export type ApiFileRoute = Partial<
  Record<
    'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'use',
    ReturnType<typeof eventHandler>
  >
>

export const createApiFileRoute = (route: ApiFileRoute) => route
