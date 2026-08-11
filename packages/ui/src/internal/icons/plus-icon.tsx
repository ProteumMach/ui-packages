import React from 'react'
import Svg from '../../common/svg'

const PlusIcon = ({ ...props }) => (
  <Svg viewBox="0 0 24 24" {...props}>
    <title>Plus Icon</title>
    <polygon points="11 19 11 13 5 13 5 11 11 11 11 5 13 5 13 11 19 11 19 13 13 13 13 19" />
  </Svg>
)

PlusIcon.displayName = 'Plus'

export default PlusIcon
