import React, { ReactNode, useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  Panel as BasePanel,
  type PanelProps as BasePanelProps,
  type PanelSize,
  usePanelRef,
} from 'react-resizable-panels'
import { Collapsed } from './collapsed'
import { useLayoutChanged } from './layout-context'

type PanelProps = BasePanelProps & {
  children?: ReactNode
  onExpand?: () => void
  onCollapse?: () => void
}

const DEFAULT_COLLAPSED_SIZE = 20

export const Panel = ({
  collapsible,
  collapsedSize = collapsible ? DEFAULT_COLLAPSED_SIZE : undefined,
  panelRef: panelRefProp,
  onResize: onResizeProp,
  onExpand: onExpandProp,
  onCollapse: onCollapseProp,
  defaultSize,
  children,
  ...props
}: PanelProps) => {
  const internalRef = usePanelRef()
  const panelRef = panelRefProp ?? (collapsible ? internalRef : undefined)

  const collapsedPx = typeof collapsedSize === 'number' ? collapsedSize : 0
  const [width, setWidth] = useState(
    typeof defaultSize === 'number' ? defaultSize : collapsedPx + 1,
  )
  const wasCollapsedRef = useRef(false)

  const notifyLayoutChanged = useLayoutChanged()

  const handleResize = useCallback(
    (size: PanelSize, id: string | number | undefined, prevSize: PanelSize | undefined) => {
      const isCollapsed = Boolean(collapsible && size.inPixels <= collapsedPx)
      const wasCollapsed = wasCollapsedRef.current
      if (isCollapsed !== wasCollapsed) {
        wasCollapsedRef.current = isCollapsed
        flushSync(() => setWidth(size.inPixels))
        if (isCollapsed) {
          onCollapseProp?.()
        } else {
          onExpandProp?.()
        }
        if (props.id) {
          notifyLayoutChanged?.()
        }
      } else {
        setWidth(size.inPixels)
      }
      onResizeProp?.(size, id, prevSize)
    },
    [
      collapsible,
      collapsedPx,
      onResizeProp,
      onExpandProp,
      onCollapseProp,
      props.id,
      notifyLayoutChanged,
    ],
  )

  const handleExpand = useCallback(() => {
    if (panelRef && 'current' in panelRef) {
      panelRef.current?.expand()
    }
    onExpandProp?.()
    if (props.id) {
      notifyLayoutChanged?.()
    }
  }, [panelRef, onExpandProp, props.id, notifyLayoutChanged])

  return (
    <BasePanel
      collapsible={collapsible}
      collapsedSize={collapsedSize}
      panelRef={panelRef}
      onResize={collapsible ? handleResize : onResizeProp}
      defaultSize={defaultSize}
      {...props}
    >
      {collapsible && width <= collapsedPx ? <Collapsed onExpand={handleExpand} /> : children}
    </BasePanel>
  )
}
