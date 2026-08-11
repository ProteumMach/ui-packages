import React, { RefAttributes } from 'react'
import {
  Combobox as BaseCombobox,
  ComboboxIconProps as BaseComboboxIconProps,
} from '@base-ui/react'

export type ComboboxIconProps = BaseComboboxIconProps & RefAttributes<HTMLDivElement>

export const Icon = ({ children, ...props }: ComboboxIconProps) => {
  return <BaseCombobox.Icon {...props}>{children}</BaseCombobox.Icon>
}
