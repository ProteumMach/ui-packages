import { Actions, DialogActionsProps } from './actions'
import { Confirm, DialogConfirmProps } from './confirm-button'
import { Dismiss, DialogDismissProps } from './dismiss-button'
import { Message, DialogMessageProps } from './message'
import { Provider, DialogProviderProps, useDialog } from './provider'
import { DialogRootProps, Dialog as DialogRoot } from './dialog'
import { DialogTitleProps, Title } from './title'

type DialogCompoundType = typeof DialogRoot & {
  Provider: typeof Provider
  Title: typeof Title
  Message: typeof Message
  Actions: typeof Actions
  Confirm: typeof Confirm
  Dismiss: typeof Dismiss
  useDialog: typeof useDialog
}

export const Dialog: DialogCompoundType = Object.assign(DialogRoot, {
  Provider,
  Title,
  Message,
  Actions,
  Confirm,
  Dismiss,
  useDialog,
})

export type {
  DialogRootProps,
  DialogProviderProps,
  DialogTitleProps,
  DialogMessageProps,
  DialogActionsProps,
  DialogConfirmProps,
  DialogDismissProps,
}
