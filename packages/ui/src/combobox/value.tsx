import React, { HTMLAttributes } from 'react'
import {
  Combobox as BaseCombobox,
  ComboboxValueProps as BaseComboboxValueProps,
} from '@base-ui/react'

export type ComboboxValueProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
  BaseComboboxValueProps

export const Value = ({ children, ...props }: ComboboxValueProps) => {
  return <BaseCombobox.Value {...(props as BaseComboboxValueProps)}>{children}</BaseCombobox.Value>
}
