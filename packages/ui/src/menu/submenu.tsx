import React from 'react'
import {
  Menu as BaseMenu,
  MenuSubmenuRootProps as BaseMenuSubmenuRootProps,
  ContextMenu,
} from '@base-ui/react'
import { MenuProvider, useMenu } from './menu-context'

export type MenuSubmenuRootProps = BaseMenuSubmenuRootProps

export const Submenu = ({ ...props }: MenuSubmenuRootProps) => {
  const { context } = useMenu()

  return (
    <MenuProvider context={context ?? false} submenu={true}>
      {!context && <ContextMenu.SubmenuRoot {...props} />}
      {context && <BaseMenu.SubmenuRoot {...props} />}
    </MenuProvider>
  )
}
