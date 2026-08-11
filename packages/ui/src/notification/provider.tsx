import React, { ReactNode, createContext, useContext, useMemo } from 'react'
import {
  Toast as BaseToast,
  ToastProviderProps as BaseToastProviderProps,
  UseToastManagerReturnValue,
} from '@base-ui/react'
import { NotificationVariant } from './list'

// Create a separate context for the notification manager
// This allows notifications to have their own independent toast stack
const NotificationContext = createContext<UseToastManagerReturnValue | null>(null)

export type NotificationProviderProps = Omit<BaseToastProviderProps, 'children'> & {
  children?: ReactNode
}

export const Provider = ({ children, ...props }: NotificationProviderProps) => (
  <BaseToast.Provider {...props}>
    <NotificationContextProvider>{children}</NotificationContextProvider>
  </BaseToast.Provider>
)

// Internal component that captures and provides the toast manager
const NotificationContextProvider = ({ children }: { children?: ReactNode }) => {
  const toastManager = BaseToast.useToastManager()
  return (
    <NotificationContext.Provider value={toastManager}>{children}</NotificationContext.Provider>
  )
}

export type NotificationManager = {
  toasts: UseToastManagerReturnValue['toasts']
  add: <Data extends object>(
    options: Parameters<UseToastManagerReturnValue['add']>[0] & {
      variant: NotificationVariant
    } & { data?: Data },
  ) => string
  close: UseToastManagerReturnValue['close']
  update: UseToastManagerReturnValue['update']
  promise: UseToastManagerReturnValue['promise']
}

export const useNotificationManager = (): NotificationManager => {
  const toastManager = useContext(NotificationContext)

  if (!toastManager) {
    throw new Error('useNotificationManager must be used within a Notification.Provider')
  }

  return useMemo(
    () => ({
      toasts: toastManager.toasts,
      close: toastManager.close,
      update: toastManager.update,
      promise: toastManager.promise,
      add: ({ variant = 'info', ...props }) => {
        return toastManager.add({
          ...props,
          data: { ...props.data, variant, type: 'notification' },
        })
      },
    }),
    [toastManager],
  )
}

export const useNotificationToastManager = (): UseToastManagerReturnValue => {
  const toastManager = useContext(NotificationContext)

  if (!toastManager) {
    throw new Error('useNotificationToastManager must be used within a Notification.Provider')
  }

  return toastManager
}
