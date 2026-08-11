import { ReactElement } from 'react'
import { List, TabsListProps } from './list'
import { Tab, TabProps } from './tab'
import { Tabs as TabsRoot, TabsProps } from './tabs'
import { TabsSize, useTabs } from './tabs-context'

type TabsCompoundType = {
  (props: TabsProps): ReactElement
  List: typeof List
  Tab: typeof Tab
  useTabs: typeof useTabs
}

export const Tabs: TabsCompoundType = Object.assign(TabsRoot, {
  List,
  Tab,
  useTabs,
})

export type { TabsProps, TabsListProps, TabProps, TabsSize }
