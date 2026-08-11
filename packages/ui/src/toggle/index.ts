import { ReactElement } from 'react'
import { Item, ToggleItemProps } from './item'
import { ToggleProps, Toggle as ToggleRoot } from './toggle'
import { useToggle } from './toggle-context'

type ToggleCompoundType = {
  (props: ToggleProps): ReactElement
  Item: typeof Item
  useToggle: typeof useToggle
}

export const Toggle: ToggleCompoundType = Object.assign(ToggleRoot, {
  Item,
  useToggle,
})

export type { ToggleProps, ToggleItemProps }
