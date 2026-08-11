import { ReactElement } from 'react'
import { BreadcrumbsRoot, BreadcrumbsProps } from './breadcrumbs'
import { Item, BreadcrumbsItemProps } from './item'

type BreadcrumbsCompoundType = {
  (props: BreadcrumbsProps): ReactElement
  Item: typeof Item
}

export const Breadcrumbs: BreadcrumbsCompoundType = Object.assign(BreadcrumbsRoot, { Item })

export type { BreadcrumbsProps, BreadcrumbsItemProps }
