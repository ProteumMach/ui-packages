import { ReactElement } from 'react'
import { Action, AttributionActionProps } from './action'
import { At, AttributionAtProps } from './at'
import { AttributionProps, Attribution as AttributionRoot } from './attribution'
import { AttributionByProps, By } from './by'

type AttributionCompoundType = {
  (props: AttributionProps): ReactElement
  Action: typeof Action
  At: typeof At
  By: typeof By
}

export const Attribution: AttributionCompoundType = Object.assign(AttributionRoot, {
  Action,
  At,
  By,
})

export type { AttributionProps, AttributionActionProps, AttributionAtProps, AttributionByProps }
