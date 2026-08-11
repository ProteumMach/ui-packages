import { createContext, useContext } from 'react'

export type DialogVariant = 'danger' | 'success'

export interface DialogContextValue {
  onConfirm: () => void
  onDismiss: () => void
  variant: DialogVariant
}

export const DialogContext = createContext<DialogContextValue | null>(null)

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext)

  if (!context) {
    throw new Error('Dialog compound components must be used within a Dialog.Provider')
  }

  return context
}
