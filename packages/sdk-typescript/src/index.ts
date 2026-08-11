import { createToolpathClient, type ToolpathClientOptions } from './client.js'
import { Toolpath } from './toolpath.js'

export const createToolpath = (options: ToolpathClientOptions): Toolpath => new Toolpath(options)

export { createToolpathClient, type ToolpathClient, type ToolpathClientOptions } from './client.js'
export {
  Toolpath,
  ToolpathWorkflowError,
  type AnalyzePartOptions,
  type WorkflowStage,
} from './toolpath.js'
export type { components, operations, paths } from './generated/schema.js'
