import { Cell } from './cell'
import { HeaderCell, HeaderCellContent, HeaderCellInteractive } from './header-cell'
import { HeaderRow } from './header-row'
import { Row } from './row'
import { useTable } from './table-context'
import { type TableDensity as TableDensityType } from './table-context'
import { useRow } from './row-context'
import { useCell } from './cell-context'
import { useCheckbox } from './use-checkbox'
import { TableEmpty } from './table-empty'
import {
  TableRoot,
  TableProps,
  type TableSelectedRows as TableSelectedRowsType,
  type TableSortState as TableSortStateType,
  type TableSort as TableDefaultSortType,
  type TableSortDirection as TableDefaultSortDirectionType,
} from './table'
import { ReactElement } from 'react'

export type TableSelectedRows = TableSelectedRowsType | undefined
export type TableSortState = TableSortStateType
export type TableDefaultSort = TableDefaultSortType
export type TableDefaultSortDirection = TableDefaultSortDirectionType
export type TableDensity = TableDensityType

type TableCompoundType = {
  <T>(props: TableProps<T>): ReactElement
  HeaderRow: typeof HeaderRow
  HeaderCell: typeof HeaderCell
  HeaderCellContent: typeof HeaderCellContent
  HeaderCellInteractive: typeof HeaderCellInteractive
  Row: typeof Row
  Cell: typeof Cell
  useTable: typeof useTable
  useRow: typeof useRow
  useCell: typeof useCell
  useCheckbox: typeof useCheckbox
  Empty: typeof TableEmpty
}

const TableCompound: TableCompoundType = Object.assign(TableRoot, {
  HeaderRow,
  HeaderCell,
  HeaderCellContent,
  HeaderCellInteractive,
  Row,
  Cell,
  useTable,
  useRow,
  useCell,
  useCheckbox,
  Empty: TableEmpty,
})

export { TableCompound as Table }
