import React from 'react'
import Svg from '../../common/svg'

const MinusIcon = ({ ...props }) => (
  <Svg viewBox="0 0 24 24" {...props}>
    <title>Minus Icon</title>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 13H5v-2h14v2z" />
  </Svg>
)

MinusIcon.displayName = 'Minus'

export default MinusIcon
