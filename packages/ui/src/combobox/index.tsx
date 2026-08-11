import { ReactElement } from 'react'
import { Button, ComboboxButtonProps } from './button'
import { ComboboxProps, Combobox as ComboboxRoot } from './combobox'
import { useCombobox } from './combobox-context'
import { ComboboxEmptyProps, Empty } from './empty'
import { ComboboxGroupProps, Group } from './group'
import { ComboboxGroupLabelProps, GroupLabel } from './group-label'
import { ComboboxIconProps, Icon } from './icon'
import { ComboboxInputProps, Input } from './input'
import { ComboboxItemProps, Item } from './item'
import { ComboboxItemIndicatorProps, ItemIndicator } from './item-indicator'
import { ComboboxListProps, List } from './list'
import { ComboboxPopoverProps, Popover } from './popover'
import { ComboboxTriggerProps, Trigger } from './trigger'
import { ComboboxValueProps, Value } from './value'

type ComboboxCompoundType = {
  <T>(props: ComboboxProps<T>): ReactElement
  Empty: typeof Empty
  Group: typeof Group
  GroupLabel: typeof GroupLabel
  Input: typeof Input
  Item: typeof Item
  ItemIndicator: typeof ItemIndicator
  List: typeof List
  Popover: typeof Popover
  Trigger: typeof Trigger
  Button: typeof Button
  Value: typeof Value
  Icon: typeof Icon
  useCombobox: typeof useCombobox
}

export const Combobox: ComboboxCompoundType = Object.assign(ComboboxRoot, {
  Empty,
  Group,
  GroupLabel,
  Input,
  Item,
  ItemIndicator,
  List,
  Popover,
  Trigger,
  Button,
  Value,
  Icon,
  useCombobox,
})

export type {
  ComboboxProps,
  ComboboxEmptyProps,
  ComboboxGroupProps,
  ComboboxGroupLabelProps,
  ComboboxInputProps,
  ComboboxItemProps,
  ComboboxItemIndicatorProps,
  ComboboxListProps,
  ComboboxPopoverProps,
  ComboboxTriggerProps,
  ComboboxValueProps,
  ComboboxIconProps,
  ComboboxButtonProps,
}
