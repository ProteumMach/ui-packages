// Engine integrations should import from `@toolpath/viewer/engine`, which keeps
// the generic scene API and the Engine adapter boundary explicit. The root
// re-exports the adapter's entry points for callers that only ever render a
// report.
export { EnginePart, normalizePartReport } from './engine/index.js'
export { PartMesh } from './part-mesh.js'
export { Axes, Grid, OrientationCube, ViewCube } from './primitives.js'
export {
  CHAMFER,
  VIEW_NAMES,
  VIEW_SIGNS,
  cubeOutlineGeometry,
  cubeZones,
  labelGeometry,
  labelTexture,
  panelGeometry,
  viewKind,
  viewUp,
  viewVector,
} from './render/view-cube.js'
export { gridGeometry, gridSpec } from './render/grid.js'
export { CadCameraControls } from './camera.js'
export {
  CAD_CAMERA_UP,
  DEFAULT_FIT_MARGIN,
  EXCLUDE_FROM_FRAME,
  PERSPECTIVE_FOV,
  applyProjection,
  aspectRatio,
  boundsFromBox,
  cadViewDirections,
  contentBounds,
  currentViewDirection,
  defaultBounds,
  fitDistance,
  orthographicHalfHeight,
  perspectiveFitDistance,
  startPosition,
} from './render/camera.js'
export { ExtendedCameraControls } from './render/controls.js'
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
export {
  CANDIDATE_WEIGHT,
  HIGHLIGHT_WEIGHT,
  HOVER_WEIGHT,
  applyHighlightLayers,
} from './render/paint.js'
export { NO_MODIFIERS, buildPick, focusForPick, viewDirection } from './render/picking.js'
export type { BuildPickInput, PartPick, PickModifiers } from './render/picking.js'
export type { ViewerControls, ViewerHandle, ViewerView } from './types.js'
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
export type { FeatureHighlight, HighlightLayers, RegionHighlight } from './render/paint.js'
export type { ViewerTheme } from './render/theme.js'
export type { PartMeshProps } from './part-mesh.js'
export type { AxesProps, GridProps, OrientationCubeProps, ViewCubeProps } from './primitives.js'
export type { CubeZone, ViewKind, ViewName } from './render/view-cube.js'
export type { GridSpec } from './render/grid.js'
export type { CadCameraControlsProps } from './camera.js'
export type { Projection, SceneBounds, ViewerCamera, ViewportSize } from './render/camera.js'
export type { ControlScheme, ExtendedCameraControlsOptions } from './render/controls.js'
export type { ViewerProps } from './viewer.js'
