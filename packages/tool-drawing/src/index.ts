/**
 * `@toolpath/tool-drawing` — a cutting tool and its holder, drawn in 2D.
 *
 * The public surface is the component, the input contract a consumer's adapter
 * targets, and the layout engine that places an outline on a sheet.
 */

export type { Provenance, ViewerAssembly, ViewerHolder, ViewerTool } from './model/types.js'
export type { Box, Extent, Frame, FrameOptions, Orientation, Padding } from './model/frame.js'
export { frameFor, orientationFor, typeSizeFor } from './model/frame.js'
export type {
  AngleDimension,
  BandRoom,
  DimensionFigure,
  DimensionLayout,
  FormatLength,
  LabelBox,
  LengthDimension,
  Side,
  ToolDimensions,
  WidthDimension,
} from './model/dimensions.js'
export {
  bandOffset,
  bandRoom,
  dimensionLabel,
  dimensionLayout,
  dimensionsFor,
  figureHeight,
  figureType,
  formatMillimetres,
  laneOffset,
  stackLabels,
} from './model/dimensions.js'
export type { DrawingContext } from './render/drawing-context.js'
export { useDrawingContext } from './render/drawing-context.js'
export type { Sheet, Theme } from './render/sheet.js'
export { SHEETS } from './render/sheet.js'
export type { ToolDrawingProps } from './render/tool-drawing.js'
export { ToolDrawing } from './render/tool-drawing.js'
