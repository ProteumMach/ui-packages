import { GizmoHelper, GizmoViewport } from '@react-three/drei'

export interface GridProps {
  size?: number
  divisions?: number
  color?: string
  centerColor?: string
}

export const Grid = ({
  size = 100,
  divisions = 20,
  color = '#536070',
  centerColor = '#8390a1',
}: GridProps) => (
  <gridHelper
    args={[size, divisions, centerColor, color]}
    rotation={[Math.PI / 2, 0, 0]}
    userData={{ viewerExcludeFromFrame: true }}
  />
)

export interface AxesProps {
  size?: number
}

export const Axes = ({ size = 25 }: AxesProps) => (
  <axesHelper args={[size]} userData={{ viewerExcludeFromFrame: true }} />
)

export interface OrientationCubeProps {
  alignment?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  margin?: [number, number]
}

export const OrientationCube = ({
  alignment = 'top-right',
  margin = [80, 80],
}: OrientationCubeProps) => (
  <GizmoHelper alignment={alignment} margin={margin}>
    <GizmoViewport axisColors={['#d95757', '#64a36e', '#5a82d9']} labelColor="white" />
  </GizmoHelper>
)
