import { eventHandler, EventHandlerRequest } from 'h3'

export type ApiFileRoute<T> = Partial<
  Record<
    'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'use',
    ReturnType<typeof eventHandler<EventHandlerRequest, T>>
  >
>

export const createApiFileRoute = <T>(route: ApiFileRoute<T>) => route
