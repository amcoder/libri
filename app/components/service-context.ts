import { createContext, useContext } from 'react'
import { LibriService } from '~/lib/service'

export const ServiceContext = createContext<LibriService | null>(null)

export function useLibriService() {
  return useContext(ServiceContext)
}
