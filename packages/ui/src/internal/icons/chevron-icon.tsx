import React from 'react'
import Svg from '../../common/svg'

const ChevronIcon = ({ ...props }) => (
  <Svg viewBox="0 0 24 24" {...props}>
    <title>Chevron Icon</title>
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
  </Svg>
)

ChevronIcon.displayName = 'Chevron'

export default ChevronIcon
