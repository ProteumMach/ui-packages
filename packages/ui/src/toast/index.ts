import { UseToastManagerReturnValue } from '@base-ui/react'
import { CustomToastData, List } from './list'
import { Provider, ToastProviderProps, useToastManager } from './provider'

type ToastCompoundType = {
  List: typeof List
  Provider: typeof Provider
  useToastManager: typeof useToastManager
}

export const Toast: ToastCompoundType = Object.assign({
  List,
  Provider,
  useToastManager,
})

type ToastManager = UseToastManagerReturnValue

export type { ToastProviderProps, ToastManager, CustomToastData }
