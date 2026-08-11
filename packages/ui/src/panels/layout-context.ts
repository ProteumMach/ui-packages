import { createContext, useContext } from 'react'

export const LayoutContext = createContext<(() => void) | null>(null)

export const useLayoutChanged = () => useContext(LayoutContext)
