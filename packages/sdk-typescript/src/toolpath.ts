import { readFile } from 'node:fs/promises'

import { createToolpathClient, type ToolpathClient, type ToolpathClientOptions } from './client.js'
import type { components } from './generated/schema.js'

export type WorkflowStage = 'create' | 'upload' | 'analyze' | 'report'

export class ToolpathWorkflowError extends Error {
  readonly stage: WorkflowStage
  readonly details: unknown

  constructor(stage: WorkflowStage, message: string, details?: unknown, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ToolpathWorkflowError'
    this.stage = stage
    this.details = details
  }
}

export interface AnalyzePartOptions {
  idempotencyKey?: string
  pollIntervalMs?: number
  onStatus?: (message: string) => void
}

const problemMessage = (error: unknown, response: Response): string =>
  error ? JSON.stringify(error) : `HTTP ${response.status}`

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

export class Toolpath {
  readonly api: ToolpathClient
  readonly #fetch: typeof globalThis.fetch

  constructor(options: ToolpathClientOptions) {
    this.api = createToolpathClient(options)
    this.#fetch = options.fetch ?? globalThis.fetch
  }

  async analyzePart(
    filePath: string,
    {
      idempotencyKey = globalThis.crypto.randomUUID(),
      pollIntervalMs = 2_000,
      onStatus,
    }: AnalyzePartOptions = {},
  ): Promise<components['schemas']['PartReportResponse']> {
    let file: Buffer
    try {
      file = await readFile(filePath)
    } catch (cause) {
      throw new ToolpathWorkflowError(
        'upload',
        `Could not read part file: ${filePath}`,
        undefined,
        {
          cause,
        },
      )
    }

    const created = await this.api.POST('/v1/parts', {
      params: { query: { filename: filePath.split(/[\\/]/).pop() ?? filePath } },
    })
    if (!created.data) {
      throw new ToolpathWorkflowError(
        'create',
        `Could not create the part: ${problemMessage(created.error, created.response)}`,
        created.error,
      )
    }

    let uploaded: Response
    try {
      uploaded = await this.#fetch(created.data.uploadUrl, {
        method: 'PUT',
        body: file as unknown as BodyInit,
      })
    } catch (cause) {
      throw new ToolpathWorkflowError('upload', 'Could not upload the part', undefined, { cause })
    }
    if (!uploaded.ok) {
      throw new ToolpathWorkflowError(
        'upload',
        `Could not upload the part: HTTP ${uploaded.status}`,
        uploaded,
      )
    }

    const analysis = await this.api.POST('/v1/parts/{id}/analyze', {
      params: {
        path: { id: created.data.partId },
        header: { 'Idempotency-Key': idempotencyKey },
      },
    })
    if (!analysis.data) {
      throw new ToolpathWorkflowError(
        'analyze',
        `Could not start analysis: ${problemMessage(analysis.error, analysis.response)}`,
        analysis.error,
      )
    }

    onStatus?.(`Analysis started as job ${analysis.data.jobId}`)
    for (;;) {
      const report = await this.api.GET('/v1/parts/{id}/report', {
        params: {
          path: { id: created.data.partId },
          query: { jobId: analysis.data.jobId },
        },
      })
      if (report.data) {
        return report.data as components['schemas']['PartReportResponse']
      }
      if (report.response.status !== 404) {
        throw new ToolpathWorkflowError(
          'report',
          `Could not get the report: ${problemMessage(report.error, report.response)}`,
          report.error,
        )
      }

      onStatus?.('Waiting for the report...')
      await wait(pollIntervalMs)
    }
  }
}
