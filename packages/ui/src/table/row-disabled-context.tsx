import { createContext, useContext } from 'react'

const RowDisabledContext = createContext(false)

export const RowDisabledProvider = RowDisabledContext.Provider

export const useRowDisabled = () => useContext(RowDisabledContext)
