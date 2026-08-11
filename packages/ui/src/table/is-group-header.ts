import { TableNode } from '@table-library/react-table-library/types/table'

export const isGroupHeader = (item: TableNode) => {
  return typeof item?.id === 'undefined'
}
