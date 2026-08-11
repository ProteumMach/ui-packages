import React from 'react'
import {
  Combobox as BaseCombobox,
  ComboboxGroupProps as BaseComboboxGroupProps,
} from '@base-ui/react'

export type ComboboxGroupProps = BaseComboboxGroupProps

export const Group = ({ children, ...props }: ComboboxGroupProps) => (
  <BaseCombobox.Group {...props}>{children}</BaseCombobox.Group>
)
