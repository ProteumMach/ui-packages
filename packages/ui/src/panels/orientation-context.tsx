import { createContext, useContext } from 'react'

export const OrientationContext = createContext<'horizontal' | 'vertical'>('horizontal')

export const useOrientation = () => useContext(OrientationContext)
