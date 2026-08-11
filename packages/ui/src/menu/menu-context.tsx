import React, { FC, ReactNode, createContext, useContext, useMemo } from 'react'

export interface MenuContextInterface {
  context: boolean
  submenu: boolean
}

const MenuContext = createContext<Partial<MenuContextInterface>>({} as MenuContextInterface)

interface ProviderProps {
  context: boolean
  submenu?: boolean
  children: ReactNode
}

const MenuProvider: FC<ProviderProps> = ({ context = false, submenu = false, children }) => {
  const value = useMemo(() => ({ context, submenu }), [context, submenu])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

const useMenu = () => useContext(MenuContext)
const MenuConsumer = MenuContext.Consumer
export { useMenu, MenuProvider, MenuContext, MenuConsumer }
