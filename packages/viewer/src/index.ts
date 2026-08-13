// Engine integrations should import from `@toolpath/viewer/engine`, which keeps
// the generic scene API and the Engine adapter boundary explicit. The root
// re-exports the adapter's entry points for callers that only ever render a
// report.
export { EnginePart, normalizePartReport } from './engine/index.js'
export { PartMesh } from './part-mesh.js'
export { Axes, Grid, OrientationCube } from './primitives.js'
export {
  CAD_CAMERA_UP,
  CadOrbitControls,
  cadViewDirections,
  cameraDistanceLimits,
  clampCameraTarget,
  configureCadCamera,
  currentCadViewDirection,
  frameCadCamera,
} from './camera.js'
export { useViewerControls, Viewer } from './viewer.js'
export { PartReportFormatError, UnsupportedKernelVersionError } from './model/errors.js'
export { buildRegionIndex } from './model/region-index.js'
export {
  directionIndexOf,
  directionLabel,
  groupByDirection,
  sameDirection,
} from './model/directions.js'
export { regionNormals } from './model/normals.js'
export {
  DEFAULT_THEME,
  DIRECTION_COLORS,
  HIGHLIGHT_COLORS,
  directionColor,
  resolveTheme,
  themesEqual,
} from './render/theme.js'
export {
  FEATURE_TYPE_RANKS,
  bestOwner,
  cycleOwner,
  featureTypeRank,
  rankOwners,
} from './render/selection.js'
export {
  REGION_ATTRIBUTE,
  buildRegionAttribute,
  buildRegionTexels,
  createPart,
} from './render/part.js'
export type { FeaturePointerEvent, ViewerControls, ViewerHandle, ViewerView } from './types.js'
export type {
  FeatureTag,
  FeatureType,
  PartMeshRefs,
  PartModel,
  PartModelFeature,
  PartModelRegion,
  RegionIndex,
  TriangleRange,
  Vec3,
} from './model/types.js'
export type { DirectionGroup } from './model/directions.js'
export type { RankingContext } from './render/selection.js'
export type { PartObject, RegionPaint } from './render/part.js'
export type { ViewerTheme } from './render/theme.js'
export type { PartMeshProps } from './part-mesh.js'
export type { AxesProps, GridProps, OrientationCubeProps } from './primitives.js'
export type { CameraDistanceLimits, CameraPanBounds } from './camera.js'
export type { ViewerProps } from './viewer.js'
