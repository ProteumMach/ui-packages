import { isNumber, mapValues, reduce } from 'lodash-es'
import { Children, ReactElement, ReactNode, isValidElement } from 'react'
import { TableNode } from '@table-library/react-table-library/types/table'
import { isGroupHeader } from './is-group-header'
import { useTable } from './table-context'

interface ColumnProps {
  sortKey?: string
  sortFn?: (array: Array<TableNode>) => Array<TableNode>
}

interface HeaderProps {
  children?: ReactNode
}

export const useSortFunctions = (header: ReactElement<HeaderProps>, grouped?: boolean) => {
  const sortFunctions: Record<number, (array: Array<TableNode>) => Array<TableNode>> = {}
  const { select } = useTable()

  const defaultSort = (sortKey: string) => {
    return (array: Array<TableNode>) => {
      // If an array of numbers then sort numerically.
      if (isNumber(array[0][sortKey])) {
        return array.sort((a, b) => a[sortKey] - b[sortKey])
      }

      // Otherwise, sort alphabetically.
      return array.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
          return -1
        }

        if (a[sortKey] > b[sortKey]) {
          return 1
        }

        return 0
      })
    }
  }

  Children.toArray(header.props.children).forEach((child, index) => {
    if (!isValidElement<ColumnProps>(child)) {
      return
    }

    const sortKey = child.props.sortKey
    sortFunctions[select ? index + 1 : index] = !child.props.sortFn
      ? defaultSort(sortKey!)
      : child.props.sortFn
  })

  const groupSort = (sortFunction: (tableList: Array<TableNode>) => Array<TableNode>) => {
    return (tableList: Array<TableNode>) => {
      const splitLists = reduce(
        tableList,
        (acc, item) => {
          if (isGroupHeader(item)) {
            acc.push([])
          } else {
            acc[acc.length - 1].push(item)
          }
          return acc
        },
        [] as Array<Array<TableNode>>,
      )

      splitLists.map((list) => (list.length ? sortFunction(list) : list))

      const combineLists: Array<TableNode | Array<TableNode>> = []
      const headers = tableList.filter((item) => isGroupHeader(item))
      for (let i = 0; i < headers.length; i++) {
        combineLists.push(headers[i])
        combineLists.push(splitLists[i])
      }

      // The library tolerates the nested sub-lists this produces; keep the
      // vendored runtime shape and only assert the declared type.
      return combineLists as Array<TableNode>
    }
  }

  // If table items are grouped, then split them by headers before sorting
  // and then stitch back together after sorting.
  if (grouped) {
    return mapValues(sortFunctions, groupSort)
  }

  return sortFunctions
}
