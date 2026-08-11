import {
  Toast as BaseToast,
  ToastProviderProps as BaseToastProviderProps,
  UseToastManagerReturnValue,
} from '@base-ui/react'
import React, { createContext, ReactNode, useContext } from 'react'

// Create a separate context for the toast manager
// This prevents it from being shadowed by Notification.Provider's internal Toast.Provider
const ToastContext = createContext<UseToastManagerReturnValue | null>(null)

export type ToastProviderProps = BaseToastProviderProps & {
  children?: ReactNode
}

export const Provider = ({ children, ...props }: ToastProviderProps) => (
  <BaseToast.Provider {...props}>
    <ToastContextProvider>{children}</ToastContextProvider>
  </BaseToast.Provider>
)

// Internal component that captures and provides the toast manager
const ToastContextProvider = ({ children }: { children?: ReactNode }) => {
  const toastManager = BaseToast.useToastManager()
  return <ToastContext.Provider value={toastManager}>{children}</ToastContext.Provider>
}

export const useToastManager = (): UseToastManagerReturnValue => {
  const toastManager = useContext(ToastContext)

  if (!toastManager) {
    throw new Error('useToastManager must be used within a Toast.Provider')
  }

  return toastManager
}
