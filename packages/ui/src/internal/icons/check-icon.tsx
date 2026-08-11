import React from 'react'
import Svg from '../../common/svg'

const CheckIcon = ({ ...props }) => (
  <Svg viewBox="0 0 24 24" {...props}>
    <title>Check Icon</title>
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
  </Svg>
)

CheckIcon.displayName = 'Check'

export default CheckIcon
