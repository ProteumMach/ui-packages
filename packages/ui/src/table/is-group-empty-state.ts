import { TableNode } from '@table-library/react-table-library/types/table'

const GROUP_EMPTY_STATE_KEY = '__groupEmptyState'
const GROUP_EMPTY_STATE_SPACER_KEY = '__groupEmptyStateSpacer'

export const createGroupEmptyStateMarker = (spacer = false) => ({
  [GROUP_EMPTY_STATE_KEY]: true,
  [GROUP_EMPTY_STATE_SPACER_KEY]: spacer,
})

export const isGroupEmptyState = (item: TableNode) => {
  return item?.[GROUP_EMPTY_STATE_KEY] === true
}

export const isGroupEmptyStateSpacer = (item: TableNode) => {
  return item?.[GROUP_EMPTY_STATE_SPACER_KEY] === true
}
