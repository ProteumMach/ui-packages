import React, { HTMLAttributes } from 'react'
import {
  Combobox as BaseCombobox,
  ComboboxItemIndicatorProps as BaseComboboxItemIndicatorProps,
} from '@base-ui/react'

export type ComboboxItemIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> &
  BaseComboboxItemIndicatorProps

export const ItemIndicator = ({ children, ...props }: ComboboxItemIndicatorProps) => {
  return (
    <BaseCombobox.ItemIndicator {...(props as BaseComboboxItemIndicatorProps)}>
      {children}
    </BaseCombobox.ItemIndicator>
  )
}
