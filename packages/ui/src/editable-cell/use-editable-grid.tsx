import { useCallback, useEffect, useRef, useState } from 'react'
import { EditingCell, NavigateDirection } from './editable-cell'

export interface EditableGridOptions<T> {
  data: Array<T>
  fields: ReadonlyArray<string>
  getId: (item: T) => string | number
  isFieldEditable?: (item: T, field: string) => boolean
  onCommit: (rowId: string | number, field: string, rawValue: string) => void
  onBatchCommit?: (
    cells: Array<{ rowId: string | number; field: string }>,
    rawValue: string,
  ) => void
}

export const useEditableGrid = <T,>({
  data,
  fields,
  getId,
  isFieldEditable,
  onCommit,
  onBatchCommit,
}: EditableGridOptions<T>) => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const editingCellRef = useRef(editingCell)
  editingCellRef.current = editingCell
  const [additionalCells, setAdditionalCells] = useState<Array<EditingCell>>([])
  const additionalCellsRef = useRef(additionalCells)
  additionalCellsRef.current = additionalCells
  const [modifierHeld, setModifierHeld] = useState(false)

  useEffect(() => {
    if (!editingCell) {
      setModifierHeld(false)
      return
    }
    const isModifier = (e: KeyboardEvent) => e.shiftKey || e.ctrlKey || e.metaKey
    const onDown = (e: KeyboardEvent) => {
      if (isModifier(e)) {
        setModifierHeld(true)
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        setModifierHeld(false)
      }
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [editingCell])

  const commitAll = useCallback(
    (rowId: string | number, field: string, rawValue: string) => {
      const extras = additionalCellsRef.current
      if (extras.length > 0 && onBatchCommit) {
        onBatchCommit([{ rowId, field }, ...extras], rawValue)
      } else {
        onCommit(rowId, field, rawValue)
        for (const cell of extras) {
          onCommit(cell.rowId, cell.field, rawValue)
        }
      }
    },
    [onCommit, onBatchCommit],
  )

  const clearAll = useCallback(() => {
    setEditingCell(null)
    setAdditionalCells([])
  }, [])

  const handleStartEdit = useCallback((rowId: string | number, field: string) => {
    setEditingCell({ rowId, field })
    setAdditionalCells([])
  }, [])

  const handleSelectColumn = useCallback(
    (field: string) => {
      if (data.length === 0) {
        return
      }
      const firstId = getId(data[0])
      if (isFieldEditable && !isFieldEditable(data[0], field)) {
        return
      }
      setEditingCell({ rowId: firstId, field })
      setAdditionalCells(
        data.slice(1).reduce<Array<EditingCell>>((acc, item) => {
          if (!isFieldEditable || isFieldEditable(item, field)) {
            acc.push({ rowId: getId(item), field })
          }
          return acc
        }, []),
      )
    },
    [data, getId, isFieldEditable],
  )

  const handleToggleAdditional = useCallback((rowId: string | number, field: string) => {
    const ec = editingCellRef.current
    if (!ec || field !== ec.field) {
      return
    }
    if (rowId === ec.rowId && field === ec.field) {
      return
    }
    setAdditionalCells((prev) => {
      const exists = prev.some((c) => c.rowId === rowId && c.field === field)
      if (exists) {
        return prev.filter((c) => !(c.rowId === rowId && c.field === field))
      }
      return [...prev, { rowId, field }]
    })
  }, [])

  const handleSelectThrough = useCallback(
    (rowId: string | number, field: string) => {
      const ec = editingCellRef.current
      if (!ec || field !== ec.field) {
        return
      }
      if (rowId === ec.rowId) {
        return
      }

      const extras = additionalCellsRef.current
      const anchorRowId = extras.length > 0 ? extras[extras.length - 1].rowId : ec.rowId

      const anchorIdx = data.findIndex((d) => getId(d) === anchorRowId)
      const targetIdx = data.findIndex((d) => getId(d) === rowId)
      if (anchorIdx === -1 || targetIdx === -1) {
        return
      }

      const lo = Math.min(anchorIdx, targetIdx)
      const hi = Math.max(anchorIdx, targetIdx)

      const rangeCells: Array<EditingCell> = []
      for (let i = lo; i <= hi; i++) {
        const id = getId(data[i])
        if (id !== ec.rowId) {
          rangeCells.push({ rowId: id, field })
        }
      }

      setAdditionalCells((prev) => {
        const merged = [...prev]
        for (const rc of rangeCells) {
          if (!merged.some((c) => c.rowId === rc.rowId && c.field === rc.field)) {
            merged.push(rc)
          }
        }
        return merged
      })
    },
    [data, getId],
  )

  const handleExtendSelection = useCallback(
    (direction: 'up' | 'down') => {
      const ec = editingCellRef.current
      if (!ec) {
        return
      }
      const allRowIds = [ec.rowId, ...additionalCellsRef.current.map((c) => c.rowId)]
      const indices = allRowIds
        .map((id) => data.findIndex((d) => getId(d) === id))
        .filter((i) => i !== -1)

      const frontier = direction === 'down' ? Math.max(...indices) : Math.min(...indices)
      const nextIdx = direction === 'down' ? frontier + 1 : frontier - 1

      if (nextIdx < 0 || nextIdx >= data.length) {
        return
      }

      const nextRowId = getId(data[nextIdx])
      if (nextRowId === ec.rowId) {
        return
      }

      setAdditionalCells((prev) => {
        if (prev.some((c) => c.rowId === nextRowId && c.field === ec.field)) {
          return prev
        }
        return [...prev, { rowId: nextRowId, field: ec.field }]
      })
    },
    [data, getId],
  )

  const handleCommit = useCallback(
    (rowId: string | number, field: string, rawValue: string, dirty = true) => {
      if (dirty) {
        commitAll(rowId, field, rawValue)
      }
      clearAll()
    },
    [commitAll, clearAll],
  )

  const handleCancel = useCallback(() => {
    clearAll()
  }, [clearAll])

  const handleNavigate = useCallback(
    (
      rowId: string | number,
      field: string,
      rawValue: string,
      direction: NavigateDirection,
      dirty = true,
    ) => {
      handleCommit(rowId, field, rawValue, dirty)

      const rowIndex = data.findIndex((d) => getId(d) === rowId)
      const fieldIndex = fields.indexOf(field)
      if (rowIndex === -1 || fieldIndex === -1) {
        return
      }

      let nextRow = rowIndex
      let nextField = fieldIndex

      if (direction === 'next') {
        nextField++
        if (nextField >= fields.length) {
          nextField = 0
          nextRow++
        }
      } else if (direction === 'prev') {
        nextField--
        if (nextField < 0) {
          nextField = fields.length - 1
          nextRow--
        }
      } else if (direction === 'down') {
        nextRow++
      } else if (direction === 'up') {
        nextRow--
      }

      if (nextRow < 0 || nextRow >= data.length) {
        return
      }

      const targetItem = data[nextRow]
      const targetRowId = getId(targetItem)
      const targetField = fields[nextField]

      if (isFieldEditable && !isFieldEditable(targetItem, targetField)) {
        if (direction === 'prev') {
          if (nextRow <= 0) {
            return
          }
          setEditingCell({
            rowId: getId(data[nextRow - 1]),
            field: fields[fields.length - 1],
          })
        } else {
          const nextEditableIndex = fields.findIndex(
            (f, i) => i > 0 && (!isFieldEditable || isFieldEditable(targetItem, f)),
          )
          if (nextEditableIndex !== -1) {
            setEditingCell({
              rowId: targetRowId,
              field: fields[nextEditableIndex],
            })
          }
        }
        return
      }

      setEditingCell({ rowId: targetRowId, field: targetField })
    },
    [data, fields, getId, handleCommit, isFieldEditable],
  )

  return {
    editingCell,
    additionalCells,
    modifierHeld,
    handleStartEdit,
    handleSelectColumn,
    handleToggleAdditional,
    handleSelectThrough,
    handleExtendSelection,
    handleCommit,
    handleCancel,
    handleNavigate,
  }
}
