import React, { useCallback } from 'react'
import { Group as BaseGroup, type GroupProps, useGroupRef } from 'react-resizable-panels'
import { LayoutContext } from './layout-context'
import { OrientationContext } from './orientation-context'

export const Group = ({ orientation = 'horizontal', onLayoutChanged, ...props }: GroupProps) => {
  const groupRef = useGroupRef()

  const notifyLayoutChanged = useCallback(() => {
    if (onLayoutChanged && groupRef.current) {
      onLayoutChanged(groupRef.current.getLayout())
    }
  }, [onLayoutChanged, groupRef])

  return (
    <OrientationContext.Provider value={orientation}>
      <LayoutContext.Provider value={notifyLayoutChanged}>
        <BaseGroup
          orientation={orientation}
          groupRef={groupRef}
          onLayoutChanged={onLayoutChanged}
          {...props}
        />
      </LayoutContext.Provider>
    </OrientationContext.Provider>
  )
}
