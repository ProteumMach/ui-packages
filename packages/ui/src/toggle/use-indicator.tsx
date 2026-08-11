'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useToggle } from './toggle-context'

export const useIndicator = () => {
  const { value, containerRef, itemRefs } = useToggle()

  const [width, setWidth] = useState<number | null>(null)
  const [left, setLeft] = useState<number | null>(null)
  // Track if we've done the first render - use a ref so it doesn't cause re-render
  const hasRenderedOnce = useRef(false)
  // Track if animations should be enabled (after first paint)
  const [animationsEnabled, setAnimationsEnabled] = useState(false)

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const selectedButton = itemRefs.current?.get(value)

    if (!container || !selectedButton) {
      return
    }

    // Use offsetWidth/offsetLeft instead of getBoundingClientRect
    // to avoid zoom-related sizing issues
    setWidth(selectedButton.offsetWidth)
    setLeft(selectedButton.offsetLeft)
  }, [value, containerRef, itemRefs])

  // Update indicator when value changes or on mount
  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  // Enable animations only after the first render cycle completes
  useEffect(() => {
    if (width !== null && left !== null && !hasRenderedOnce.current) {
      hasRenderedOnce.current = true
      // Use requestAnimationFrame to ensure the initial position is painted first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationsEnabled(true)
        })
      })
    }
  }, [width, left])

  // Handle resize events
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateIndicator()
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    // Also observe each item for content changes
    itemRefs.current?.forEach((button) => {
      observer.observe(button)
    })

    return () => {
      observer.disconnect()
    }
  }, [updateIndicator, containerRef, itemRefs])

  return { width, left, animationsEnabled }
}
