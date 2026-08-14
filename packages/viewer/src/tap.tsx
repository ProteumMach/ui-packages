import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { type TapPoint, type TapTracker, trackTaps } from './render/tap.js'

/**
 * A click that is a click, for anything inside the canvas.
 *
 * Bound to the canvas element rather than to the object, because the gesture
 * being judged started before any object knew about it.
 */
export function useTapGuard(): (event: TapPoint) => boolean {
  const domElement = useThree((state) => state.gl.domElement)
  const tracker = useRef<TapTracker | null>(null)

  useEffect(() => {
    const tracked = trackTaps(domElement)
    tracker.current = tracked

    return () => {
      tracked.dispose()
      if (tracker.current === tracked) tracker.current = null
    }
  }, [domElement])

  return useMemo(() => (event: TapPoint) => tracker.current?.isTap(event) ?? true, [])
}
