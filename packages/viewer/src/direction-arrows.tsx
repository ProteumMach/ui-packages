import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { type Box3, Quaternion, Vector3 } from 'three'
import type { PartModel, Vec3 } from './model/types.js'
import { useContentBox } from './content-box.js'
import {
  CONE_AXIS,
  HEAD,
  HEAD_RADIUS,
  LENGTH,
  SHAFT_RADIUS,
  arrowPlacement,
} from './render/directions.js'
import { type ViewerTheme, directionColor, resolveTheme } from './render/theme.js'

export interface NamedDirection {
  readonly direction: Vec3
  readonly color: number
  readonly index: number
}

export interface DirectionArrowsProps {
  /** The report, for its `candidateDirections`. */
  model: PartModel
  /**
   * Shows one direction on its own. Choosing a direction is a way of asking
   * about that direction, so the others leave rather than dimming: five faded
   * arrows still cross the part, still hide surfaces behind them, and still
   * read as choices when only one is being asked about.
   */
  activeDirection?: number | null
  /**
   * Shows one direction's arrow without scoping anything, for "the feature
   * being read came from this way". Falls back to `activeDirection`.
   */
  shownDirection?: number | null
  /**
   * A direction being named, drawn while it is aimed. Not a candidate and not a
   * selection: a way up that does not exist yet, so it is drawn over the part —
   * an arrow being aimed that hides behind the geometry looks like it has
   * stopped responding.
   */
  previewDirection?: Vec3 | null
  /**
   * Ways up that are held but were never candidates. A direction somebody named
   * is as real as one the Engine proposed, and without an arrow it is a row in a
   * list describing an orientation nothing on the part shows.
   */
  namedDirections?: readonly NamedDirection[]
  onPickDirection?: (index: number) => void
  theme?: Partial<ViewerTheme>
  visible?: boolean
}

/**
 * One arrow per candidate direction, pointing at the part.
 *
 * Aimed *inward* on purpose: a machining direction is the direction the tool
 * comes from, so an arrow flying toward the surface reads as the setup rather
 * than as a surface normal.
 */
export const DirectionArrows = ({
  model,
  activeDirection = null,
  shownDirection,
  previewDirection = null,
  namedDirections = [],
  onPickDirection,
  theme,
  visible = true,
}: DirectionArrowsProps) => {
  const box = useContentBox()
  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const shown = shownDirection === undefined ? activeDirection : shownDirection

  if (!visible) return null

  return (
    <group>
      {model.candidateDirections.map((direction, index) => {
        if (shown !== null && shown !== index) return null
        return (
          <Arrow
            key={`candidate-${index}`}
            direction={direction}
            box={box}
            color={directionColor(index)}
            opacity={0.9}
            onPick={onPickDirection ? () => onPickDirection(index) : undefined}
          />
        )
      })}
      {namedDirections.map((named) => (
        <Arrow
          key={`named-${named.index}`}
          direction={named.direction}
          box={box}
          color={named.color}
          opacity={0.9}
          onPick={onPickDirection ? () => onPickDirection(named.index) : undefined}
        />
      ))}
      {previewDirection ? (
        <Arrow direction={previewDirection} box={box} color={resolved.hover} opacity={0.95} onTop />
      ) : null}
    </group>
  )
}

interface ArrowProps {
  direction: Vec3
  box: Box3
  color: number
  opacity: number
  onPick?: () => void
  onTop?: boolean
}

const Arrow = ({ direction, box, color, opacity, onPick, onTop = false }: ArrowProps) => {
  const invalidate = useThree((state) => state.invalidate)
  const { tip, length, quaternion } = useMemo(() => {
    const placement = arrowPlacement(direction, box)
    const aim = new Quaternion().setFromUnitVectors(
      CONE_AXIS,
      new Vector3(direction.x, direction.y, direction.z).normalize(),
    )
    return { tip: placement.tip, length: placement.length, quaternion: aim }
  }, [box, direction])

  // Re-aimed rather than rebuilt as the angle changes: a preview drags at
  // interaction rate, and tearing down a mesh per frame is how one stutters.
  const head = length * HEAD
  const shaft = length * (1 - HEAD)

  return (
    <group
      position={tip}
      quaternion={quaternion}
      renderOrder={onTop ? 10 : 3}
      onClick={
        onPick
          ? (event) => {
              event.stopPropagation()
              onPick()
              invalidate()
            }
          : undefined
      }
    >
      <mesh position={[0, head * 0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[length * HEAD_RADIUS, head, 20]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={!onTop} />
      </mesh>
      <mesh position={[0, head + shaft * 0.5, 0]}>
        <cylinderGeometry args={[length * SHAFT_RADIUS, length * SHAFT_RADIUS, shaft, 12]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={!onTop} />
      </mesh>
    </group>
  )
}

export { LENGTH as ARROW_LENGTH }
