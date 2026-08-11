import { List } from './list'
import { NotificationManager, Provider, useNotificationManager } from './provider'

type NotificationCompoundType = {
  List: typeof List
  Provider: typeof Provider
  useNotificationManager: typeof useNotificationManager
}

export const Notification: NotificationCompoundType = Object.assign({
  List,
  Provider,
  useNotificationManager,
})

export type { NotificationManager }
