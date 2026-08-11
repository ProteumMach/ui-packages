import React, { ReactNode, RefObject } from 'react'
import { useKeyboardNavigation } from './use-keyboard-navigation'

interface Props {
  indexes: Array<[number, number | string]>
  children: ReactNode
  containerRef?: RefObject<HTMLElement | null>
  data?: Array<any>
}

export const Body = ({ indexes, children, containerRef, data }: Props) => {
  useKeyboardNavigation(indexes, containerRef, data)

  return <>{children}</>
}
