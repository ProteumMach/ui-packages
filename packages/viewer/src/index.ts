// Root re-exports are retained for existing callers. New Engine integrations should import from
// `@toolpath/viewer/engine` to keep the generic scene API and Engine adapter boundary explicit.
export {
  EnginePart,
  engineFeatureRegions,
  engineMeshAssets,
  loadEngineGeometry,
} from './engine/index.js'
export {
  PartMesh,
  applyPartMaterialGroups,
  buildPartMaterialGroups,
  buildPartRenderGroups,
  featureRegionAtTriangle,
  resolveFeatureVisualState,
  sameFeatureHover,
} from './part-mesh.js'
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
export type {
  FeatureId,
  FeaturePointerEvent,
  FeatureRegion,
  PartColors,
  ViewerControls,
  ViewerHandle,
  ViewerView,
} from './types.js'
export type { EngineFeature, EnginePartReport, EngineRegion } from './engine/types.js'
export type { EnginePartProps, MeshAsset, MeshFormat } from './engine/index.js'
export type { PartMeshProps } from './part-mesh.js'
export type { AxesProps, GridProps, OrientationCubeProps } from './primitives.js'
export type { CameraDistanceLimits, CameraPanBounds } from './camera.js'
export type { ViewerProps } from './viewer.js'
