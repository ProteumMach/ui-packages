import { isNumber } from 'lodash-es'
import { ReactNode, RefObject, useCallback, useMemo, useState } from 'react'
import { createGroupEmptyStateMarker } from './is-group-empty-state'
import { getRowHeight } from './table'
import { useTable } from './table-context'

export const useGroups = (
  data: Array<any>,
  tableRef: RefObject<any>,
  grouped?: {
    counts: Array<number>
    header: (index: number) => ReactNode
    emptyState?: (index: number) => ReactNode
  },
) => {
  const { collapsedGroups, density } = useTable()
  const rowHeight = getRowHeight(density)
  const [firstIndex, setFirstIndex] = useState(0)

  if (grouped) {
    if (!Array.isArray(grouped.counts)) {
      throw new Error('Grouped counts must be an array.')
    }

    const totalGroupedItems = grouped.counts.reduce((prev, current) => prev + current, 0)
    if (totalGroupedItems !== data?.length) {
      throw new Error('All items must be assigned to a group.')
    }
  }

  const groupedData = useMemo(() => {
    if (!grouped) {
      return data || []
    }

    let offset = 0
    const groups = grouped.counts.map((count, i) => {
      const isCollapsed = collapsedGroups?.includes(i)
      const rows = !isCollapsed ? data.slice(offset, offset + count) : []

      const group = [grouped.header(i), ...rows]

      if (count === 0 && !isCollapsed && grouped.emptyState) {
        group.push(createGroupEmptyStateMarker(), createGroupEmptyStateMarker(true))
      }

      offset += count
      return group
    })
    return groups.flat()
  }, [data, grouped, collapsedGroups])

  const groupIndexByItemIndex = useMemo(() => {
    if (!grouped) {
      return []
    }

    const items: Array<number> = []
    grouped.counts.forEach((count, i) => {
      if (!collapsedGroups?.includes(i)) {
        const hasEmptyState = count === 0 && grouped.emptyState
        for (let j = 0; j < count + 1 + (hasEmptyState ? 2 : 0); j++) {
          items.push(i)
        }
      } else {
        items.push(i)
      }
    })

    return items
  }, [grouped, collapsedGroups])

  const getGroupIndex = useCallback(
    (rowIndex: number): number => {
      return groupIndexByItemIndex[rowIndex] ?? 0
    },
    [groupIndexByItemIndex],
  )

  const currentGroupIndex = useMemo(() => {
    if (!grouped) {
      return undefined
    }
    return getGroupIndex(firstIndex)
  }, [grouped, firstIndex, getGroupIndex])

  const currentGroup = useMemo(() => {
    if (!grouped || grouped.counts.length === 0) {
      return null
    }
    const groupIndex = getGroupIndex(firstIndex)
    return grouped.header(groupIndex)
  }, [grouped, firstIndex, getGroupIndex])

  const handleScroll = useCallback(() => {
    if (!grouped || !tableRef.current) {
      return
    }
    const scrollTop: number = Number(
      tableRef.current.querySelector('[data-table-library_table] > div > div')?.scrollTop,
    )

    if (scrollTop >= 0 && scrollTop <= rowHeight) {
      setFirstIndex(0)
    } else {
      try {
        groupedData.reduce((prev, _, currentIndex) => {
          const height = rowHeight
          const start = isNumber(prev) ? prev : rowHeight
          const end = start + height

          if (scrollTop >= start && scrollTop <= end) {
            setFirstIndex(currentIndex)
            throw 'BREAK'
          }

          return end
        })
      } catch (e) {
        if (e !== 'BREAK') {
          throw e
        }
      }
    }
  }, [grouped, tableRef, groupedData, rowHeight])

  return {
    data: groupedData,
    handleScroll,
    currentGroup,
    getGroupIndex,
    currentGroupIndex,
  }
}
