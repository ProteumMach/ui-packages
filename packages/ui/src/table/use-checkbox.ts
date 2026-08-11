import { useState } from 'react'
import { Identifier, TableNode } from '@table-library/react-table-library/types/table'
import { CheckboxChangeEvent } from '../checkbox'

export type UseCheckboxReturn = {
  isChecked: (item: TableNode) => boolean
  isIndeterminate: (item: TableNode) => boolean
  handleCheck: (item: TableNode, checked: boolean, event?: CheckboxChangeEvent) => void
  checkedItems: Array<Identifier>
}

export const useCheckbox = (
  items: Array<TableNode>,
  initialState?: Array<Identifier>,
): UseCheckboxReturn => {
  const [checkedRows, setCheckedRows] = useState<Array<Identifier>>(initialState || [])
  const [lastCheckedId, setLastCheckedId] = useState<Identifier | null>(null)

  // Flatten the tree into a list in visual order
  const flattenItems = (nodes: Array<TableNode>): Array<TableNode> => {
    return nodes.flatMap((node) => [node, ...flattenItems(node.nodes ?? [])])
  }

  // Find an item by ID in the tree
  const findItemById = (items: Array<TableNode>, id: Identifier): TableNode | undefined => {
    return items.reduce<TableNode | undefined>((found, item) => {
      if (found) {
        return found
      }
      if (item.id === id) {
        return item
      }
      if (item.nodes?.length) {
        return findItemById(item.nodes, id)
      }
      return undefined
    }, undefined)
  }

  // Recursively get all descendant IDs from a TreeItem
  const getAllDescendantIds = (item: TableNode): Array<Identifier> => {
    if (!item.nodes?.length) {
      return []
    }
    return item.nodes
      .filter((child) => child && child.id != null)
      .flatMap((child) => [child.id, ...getAllDescendantIds(child)])
  }

  // Get all ancestor IDs for an item
  const getAllAncestorIds = (
    items: Array<TableNode>,
    targetId: Identifier,
    path: Array<Identifier> = [],
  ): Array<Identifier> => {
    return items.reduce<Array<Identifier>>((result, item) => {
      if (result.length > 0) {
        return result
      }
      if (item.id === targetId) {
        return path
      }
      if (item.nodes?.length) {
        const found = getAllAncestorIds(item.nodes, targetId, [...path, item.id])
        if (found.length > 0 || item.nodes.some((n) => n.id === targetId)) {
          return found.length > 0 ? found : [...path, item.id]
        }
      }
      return result
    }, [])
  }

  // Get ancestors that should be auto-checked (all their descendants are checked)
  const getAncestorsToAutoCheck = (
    items: Array<TableNode>,
    targetId: Identifier,
    newCheckedIds: Array<Identifier>,
  ): Array<Identifier> => {
    const ancestorIds = getAllAncestorIds(items, targetId)

    // Walk from innermost ancestor to outermost, stop when one fails
    const result = ancestorIds
      .slice()
      .reverse()
      .reduce<{ stopped: boolean; ids: Array<Identifier> }>(
        (acc, ancestorId) => {
          if (acc.stopped) {
            return acc
          }

          const ancestor = findItemById(items, ancestorId)
          if (!ancestor) {
            return acc
          }

          const descendantIds = getAllDescendantIds(ancestor)
          const allDescendantsChecked = descendantIds.every(
            (id) => newCheckedIds.includes(id) || acc.ids.includes(id),
          )

          if (allDescendantsChecked) {
            return { stopped: false, ids: [...acc.ids, ancestorId] }
          }
          // If this ancestor isn't fully checked, outer ancestors won't be either
          return { stopped: true, ids: acc.ids }
        },
        { stopped: false, ids: [] },
      )

    return result.ids
  }

  const getDescendantCheckState = (item: TableNode) => {
    const originalItem = findItemById(items, item.id)
    const descendantIds = originalItem ? getAllDescendantIds(originalItem) : []
    const checkedCount = descendantIds.filter((id) => checkedRows.includes(id)).length

    return {
      hasChildren: descendantIds.length > 0,
      allChecked: descendantIds.length > 0 && checkedCount === descendantIds.length,
      someChecked: checkedCount > 0 && checkedCount < descendantIds.length,
      descendantIds,
    }
  }

  const isChecked = (item: TableNode): boolean => {
    const { allChecked } = getDescendantCheckState(item)
    // If all descendants are checked, treat parent as checked too
    return checkedRows.includes(item.id) || allChecked
  }

  const isIndeterminate = (item: TableNode): boolean => {
    const { hasChildren, someChecked } = getDescendantCheckState(item)
    // Indeterminate only when some (but not all/none) descendants are checked
    return hasChildren && !isChecked(item) && someChecked
  }

  const handleCheck = (item: TableNode, checked: boolean, event?: CheckboxChangeEvent) => {
    const shiftPressed = event?.shiftKey

    // Handle shift+click range selection
    if (shiftPressed && lastCheckedId !== null && checked) {
      const flatList = flattenItems(items)
      const lastIndex = flatList.findIndex((n) => n.id === lastCheckedId)
      const currentIndex = flatList.findIndex((n) => n.id === item.id)

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex)
        const end = Math.max(lastIndex, currentIndex)
        const itemsInRange = flatList.slice(start, end + 1)

        setCheckedRows((current) => {
          return itemsInRange.reduce(
            (newCheckedIds, rangeItem) => {
              const { descendantIds } = getDescendantCheckState(rangeItem)
              const allIds = [rangeItem.id, ...descendantIds]
              const idsToAdd = allIds.filter((id) => !newCheckedIds.includes(id))
              const withDescendants = [...newCheckedIds, ...idsToAdd]

              // Check if any ancestors should also be auto-checked
              const ancestorsToCheck = getAncestorsToAutoCheck(
                items,
                rangeItem.id,
                withDescendants,
              ).filter((id) => !withDescendants.includes(id))
              return [...withDescendants, ...ancestorsToCheck]
            },
            [...current],
          )
        })

        setLastCheckedId(item.id)
        return
      }
    }

    const { descendantIds } = getDescendantCheckState(item)
    const allIds = [item.id, ...descendantIds]
    const ancestorIds = getAllAncestorIds(items, item.id)
    setCheckedRows((current) => {
      if (checked) {
        // Add this item and descendants (filter duplicates)
        const idsToAdd = allIds.filter((id) => !current.includes(id))
        const newCheckedIds = [...current, ...idsToAdd]
        // Check if any ancestors should also be auto-checked
        const ancestorsToCheck = getAncestorsToAutoCheck(items, item.id, newCheckedIds).filter(
          (id) => !newCheckedIds.includes(id),
        )
        return [...newCheckedIds, ...ancestorsToCheck]
      }
      // When unchecking, also uncheck all ancestors
      const idsToRemove = [...allIds, ...ancestorIds]
      return current.filter((id) => !idsToRemove.includes(id))
    })

    setLastCheckedId(item.id)
  }

  return { isChecked, isIndeterminate, handleCheck, checkedItems: checkedRows }
}
