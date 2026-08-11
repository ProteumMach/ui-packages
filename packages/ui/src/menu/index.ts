import { ReactElement } from 'react'
import { Divider, MenuDividerProps } from './divider'
import { Item, MenuItemProps } from './item'
import { MenuProps, Menu as MenuRoot } from './menu'
import { useMenu } from './menu-context'
import { MenuPopoverProps, Popover } from './popover'
import { MenuSubmenuRootProps, Submenu } from './submenu'
import { MenuSubmenuTriggerProps, SubmenuTrigger } from './submenu-trigger'
import { MenuTriggerProps, Trigger } from './trigger'

type MenuCompoundType = {
  (props: MenuProps): ReactElement
  Divider: typeof Divider
  Item: typeof Item
  Popover: typeof Popover
  SubmenuTrigger: typeof SubmenuTrigger
  Submenu: typeof Submenu
  Trigger: typeof Trigger
  useMenu: typeof useMenu
}

export const Menu: MenuCompoundType = Object.assign(MenuRoot, {
  Divider,
  Item,
  Popover,
  SubmenuTrigger,
  Submenu,
  Trigger,
  useMenu,
})

export type {
  MenuProps,
  MenuDividerProps,
  MenuItemProps,
  MenuPopoverProps,
  MenuSubmenuTriggerProps,
  MenuSubmenuRootProps,
  MenuTriggerProps,
}
