import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'dismissed-callouts'

const getSnapshot = (): Array<string> => {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const getServerSnapshot = (): Array<string> => []

const listeners = new Set<() => void>()

const subscribe = (callback: () => void) => {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

const notifyListeners = () => {
  for (const listener of listeners) {
    listener()
  }
}

let cachedSnapshot: Array<string> | null = null

const getStableSnapshot = (): Array<string> => {
  const next = getSnapshot()
  if (
    cachedSnapshot !== null &&
    cachedSnapshot.length === next.length &&
    cachedSnapshot.every((id, i) => id === next[i])
  ) {
    return cachedSnapshot
  }
  cachedSnapshot = next
  return next
}

export const useDismissedCallouts = () => {
  const dismissed = useSyncExternalStore(subscribe, getStableSnapshot, getServerSnapshot)

  const isDismissed = useCallback((id: string) => dismissed.includes(id), [dismissed])

  const dismiss = useCallback((id: string) => {
    const current = getSnapshot()
    if (current.includes(id)) {
      return
    }
    const next = [...current, id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    cachedSnapshot = null
    notifyListeners()
  }, [])

  const reset = useCallback((id?: string) => {
    if (id) {
      const current = getSnapshot()
      const next = current.filter((d) => d !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    cachedSnapshot = null
    notifyListeners()
  }, [])

  return { isDismissed, dismiss, reset }
}
