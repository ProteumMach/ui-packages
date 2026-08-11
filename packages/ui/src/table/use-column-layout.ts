import { Children, ReactElement, ReactNode, isValidElement, useEffect, useState } from 'react'
import { useTable } from './table-context'

interface ColumnProps {
  width?: string | number
  resize?: boolean
}

interface HeaderProps {
  children?: ReactNode
}

export const useColumnLayout = (header: ReactElement<HeaderProps>, id?: string) => {
  const { select, multiselect } = useTable()
  const hasSelectionColumn = select || multiselect
  const columns = Children.toArray(header.props.children).filter(
    (child): child is ReactElement<ColumnProps> => isValidElement(child),
  )

  const formatWidth = (width: string | number | undefined): string => {
    if (width === undefined) {
      return 'minmax(0px, 1fr)'
    }

    if (typeof width === 'number') {
      return `${width}px`
    }

    return width
  }

  const initialWidths: string = `${hasSelectionColumn ? '8px' : ''} ${columns
    .map((child) => {
      const width = child.props.width
      return formatWidth(width)
    })
    .join(' ')}`

  const [columnLayout, setColumnLayout] = useState<string>(initialWidths)

  // Restore layout from localStorage when columns are available
  useEffect(() => {
    // Don't try to restore layout if columns haven't loaded yet
    // (columns are often loaded asynchronously)
    if (columns.length === 0) {
      return
    }

    // If no id, just use the default widths from props
    if (!id) {
      setColumnLayout(initialWidths)
      return
    }

    const storageKey = `table-${id}`
    const storedLayout = localStorage.getItem(storageKey)

    // No stored layout - use the default widths from props
    if (!storedLayout) {
      setColumnLayout(initialWidths)
      return
    }

    const storedColumns = storedLayout.match(/(?:minmax\([^()]*\)|[^\s]+)/g)

    // Column count mismatch - clear storage and use default widths
    if (!storedColumns || storedColumns.length !== columns.length + (hasSelectionColumn ? 1 : 0)) {
      localStorage.removeItem(storageKey)
      setColumnLayout(initialWidths)
      return
    }

    // Restore from localStorage
    setColumnLayout(storedLayout)
  }, [columns.length, hasSelectionColumn, id, initialWidths])

  // On layout change, save to local storage.
  const handleLayoutChange = (newLayout: string) => {
    if (!id) {
      return
    }

    const storageKey = `table-${id}`

    const newLayoutArray = newLayout.match(/(?:minmax\([^()]*\)|[^\s]+)/g)
    if (!newLayoutArray) {
      return
    }

    if (hasSelectionColumn) {
      newLayoutArray.shift()
    }

    let newLayoutString = newLayoutArray
      .map((width, index) => {
        const column = columns[index]
        const columnWidth = column?.props?.width
        const resizeable = column?.props?.resize !== false

        return resizeable || !columnWidth
          ? width.includes('minmax')
            ? width
            : `minmax(${width}, 1fr)`
          : formatWidth(columnWidth)
      })
      .join(' ')

    if (hasSelectionColumn) {
      newLayoutString = `8px ${newLayoutString}`
    }

    localStorage.setItem(storageKey, newLayoutString)
    setColumnLayout(newLayoutString)
  }

  return { handleLayoutChange, columnLayout }
}
