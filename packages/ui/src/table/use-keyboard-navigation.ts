import { isNull } from 'lodash-es'
import { RefObject, useCallback, useEffect, useRef } from 'react'
import { getRowHeight } from './table'
import { useTable } from './table-context'

export const useKeyboardNavigation = (
  indexes: Array<[number, number | string]>,
  containerRef?: RefObject<HTMLElement | null>,
  data?: Array<any>,
) => {
  const {
    cursor,
    setCursor,
    setSelectedRows,
    selectedRows,
    editingCell,
    setEditingCell,
    multiselect,
    keyboardNavigation,
    density,
    onBeforeSelectionChange,
  } = useTable()

  const rowHeight = getRowHeight(density)

  // Keep data ref for onBeforeSelectionChange lookups
  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Use refs to access current values in event handlers without re-registering
  const cursorRef = useRef(cursor)
  const indexesRef = useRef(indexes)
  const selectedRowsRef = useRef(selectedRows)
  const multiselectRef = useRef(multiselect)
  const editingCellRef = useRef(editingCell)
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])
  useEffect(() => {
    indexesRef.current = indexes
  }, [indexes])
  useEffect(() => {
    selectedRowsRef.current = selectedRows
  }, [selectedRows])
  useEffect(() => {
    multiselectRef.current = multiselect
  }, [multiselect])
  useEffect(() => {
    editingCellRef.current = editingCell
  }, [editingCell])

  const isFocusWithinContainer = useCallback(() => {
    if (!containerRef?.current) {
      return true // If no container ref provided, allow navigation everywhere (backwards compatible)
    }
    return containerRef.current.contains(document.activeElement)
  }, [containerRef])

  const scrollRowIntoView = useCallback(
    (rowIndex: number) => {
      if (!containerRef?.current) {
        return
      }

      // Access the virtualized table's scroll container
      const scrollContainer = containerRef.current.querySelector(
        '[data-table-library_table] > div > div',
      ) as HTMLElement | null

      if (!scrollContainer) {
        return
      }

      const scrollTop = scrollContainer.scrollTop
      const containerHeight = scrollContainer.clientHeight
      const rowTop = rowIndex * rowHeight
      const rowBottom = rowTop + rowHeight

      // Check if row is outside the visible area
      if (rowTop < scrollTop || rowBottom > scrollTop + containerHeight) {
        // Scroll to center the row in the container
        const rowCenter = rowTop + rowHeight / 2
        const targetScrollTop = rowCenter - containerHeight / 2
        scrollContainer.scrollTop = Math.max(0, targetScrollTop)
      }
      // Otherwise row is already visible, don't scroll
    },
    [containerRef, rowHeight],
  )

  const getNewSelectionState = useCallback((newId: number | string, addToSelection: boolean) => {
    if (!addToSelection || !multiselectRef.current) {
      return { ids: [], id: newId }
    }

    // When ctrl/cmd is held and multiselect is enabled, preserve existing selections
    const currentSelected = selectedRowsRef.current
    const existingIds: Array<number | string> = []

    // Collect all currently selected IDs
    if (currentSelected?.id != null) {
      existingIds.push(currentSelected.id)
    }
    if (currentSelected?.ids?.length) {
      existingIds.push(...currentSelected.ids)
    }

    // Add new ID if not already selected, or toggle it off if it is
    const newIdIndex = existingIds.indexOf(newId)
    if (newIdIndex === -1) {
      existingIds.push(newId)
    }

    // Deduplicate
    const uniqueIds = Array.from(new Set(existingIds))
    // When using ids for multi-select, id should be null (they're mutually exclusive)
    return { ids: uniqueIds, id: null }
  }, [])

  // Keep onBeforeSelectionChange ref to avoid re-registering callbacks
  const onBeforeSelectionChangeRef = useRef(onBeforeSelectionChange)
  useEffect(() => {
    onBeforeSelectionChangeRef.current = onBeforeSelectionChange
  }, [onBeforeSelectionChange])

  // Helper to check if selection change is allowed (e.g., dirty state confirmation)
  // Pass null for newId/newRowIndex when clearing selection (e.g., Escape key)
  const isSelectionChangeAllowed = useCallback(
    (newId: number | string | null, newRowIndex: number | null): boolean => {
      if (!onBeforeSelectionChangeRef.current) {
        return true
      }
      const item = newId != null ? dataRef.current?.find((d) => d.id === newId) : null
      return onBeforeSelectionChangeRef.current(item, newRowIndex) !== false
    },
    [],
  )

  const increaseCursor = useCallback(
    (addToSelection = false) => {
      const currentIndexes = indexesRef.current
      const currentCursor = cursorRef.current
      if (currentIndexes.length === 0) {
        return
      }
      const currentPosition = currentIndexes.findIndex((item) => item[0] === currentCursor)
      const newPosition = currentPosition + 1 >= currentIndexes.length ? 0 : currentPosition + 1
      const newRowIndex = currentIndexes[newPosition][0]
      const newId = currentIndexes[newPosition][1]

      if (!isSelectionChangeAllowed(newId, newRowIndex)) {
        return
      }

      setSelectedRows(getNewSelectionState(newId, addToSelection))
      scrollRowIntoView(newRowIndex)
    },
    [setSelectedRows, scrollRowIntoView, getNewSelectionState, isSelectionChangeAllowed],
  )

  const decreaseCursor = useCallback(
    (addToSelection = false) => {
      const currentIndexes = indexesRef.current
      const currentCursor = cursorRef.current
      if (currentIndexes.length === 0) {
        return
      }
      const currentPosition = currentIndexes.findIndex((item) => item[0] === currentCursor)
      const newPosition = currentPosition - 1 < 0 ? currentIndexes.length - 1 : currentPosition - 1
      const newRowIndex = currentIndexes[newPosition][0]
      const newId = currentIndexes[newPosition][1]

      if (!isSelectionChangeAllowed(newId, newRowIndex)) {
        return
      }

      setSelectedRows(getNewSelectionState(newId, addToSelection))
      scrollRowIntoView(newRowIndex)
    },
    [setSelectedRows, scrollRowIntoView, getNewSelectionState, isSelectionChangeAllowed],
  )

  // Handle arrow key navigation with preventDefault to stop page scroll
  useEffect(() => {
    if (keyboardNavigation === false) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocusWithinContainer() || isNull(cursorRef.current)) {
        return
      }

      const addToSelection = event.ctrlKey || event.metaKey || event.shiftKey

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        decreaseCursor(addToSelection)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        increaseCursor(addToSelection)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyboardNavigation, isFocusWithinContainer, increaseCursor, decreaseCursor])

  // Handle Escape key via event listener to avoid state-based re-renders
  useEffect(() => {
    if (keyboardNavigation === false) {
      return
    }
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isFocusWithinContainer()) {
        return
      }

      if (editingCellRef.current) {
        setEditingCell(null)
      } else if (selectedRowsRef.current && isSelectionChangeAllowed(null, null)) {
        setSelectedRows({ ids: [], id: null })
      }
    }

    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [
    keyboardNavigation,
    isFocusWithinContainer,
    setEditingCell,
    setSelectedRows,
    isSelectionChangeAllowed,
  ])

  const setCursorOnRowSelectionChange = useCallback(() => {
    if (selectedRows && selectedRows.id) {
      // Find all rows with matching ID
      const matchingRows = indexes.filter((item) => selectedRows.id === item[1])

      if (matchingRows.length > 0) {
        // If we have a current cursor, prefer the row at that position if it matches
        if (!isNull(cursor)) {
          const currentRow = indexes.find((item) => item[0] === cursor)
          if (currentRow && currentRow[1] === selectedRows.id) {
            // Current cursor position matches the selected ID, keep it
            return
          }

          // Find the matching row closest to the current cursor position
          const closest = matchingRows.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev[0] - cursor)
            const currDiff = Math.abs(curr[0] - cursor)
            return currDiff < prevDiff ? curr : prev
          })

          if (cursor !== closest[0]) {
            setCursor(closest[0])
          }
        } else {
          // No cursor, use the first match
          if (cursor !== matchingRows[0][0]) {
            setCursor(matchingRows[0][0])
          }
        }
      }
    } else {
      setCursor(null)
    }
  }, [cursor, selectedRows, indexes])

  useEffect(setCursorOnRowSelectionChange, [selectedRows, indexes])
}
