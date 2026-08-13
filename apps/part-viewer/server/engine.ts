import { createToolpath } from '@toolpath/api'
import type { PartFeature, PartReport } from '../app/shared/contracts'

const DATASHEET_BATCH_SIZE = 50

const apiBaseUrl = (): string => {
  const baseUrl = process.env.TOOLPATH_API_BASE_URL
  if (!baseUrl) {
    throw new Error(
      'TOOLPATH_API_BASE_URL must be set. Add the Engine API URL to apps/part-viewer/.env.',
    )
  }
  return baseUrl
}

export class EngineError extends Error {
  constructor(
    readonly status: number,
    readonly code = 'engine_request_failed',
    readonly operation = 'request',
  ) {
    super(`Toolpath Engine ${operation} failed with HTTP ${status}.`)
    this.name = 'EngineError'
  }
}

/** Safe to return to the browser; diagnostics stay in the server log. */
export const publicEngineErrorMessage = (status: number): string =>
  `Toolpath Engine request failed (HTTP ${status}).`

const engineFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init)
  } catch (cause) {
    // The configured URL and transport error help operators diagnose a deployment, but neither
    // is returned through the public API.
    console.error('[part-viewer] Engine transport failure', {
      engineUrl: apiBaseUrl(),
      error: cause instanceof Error ? cause.message : String(cause),
    })
    throw new EngineError(502, 'engine_unavailable', 'transport')
  }
}

/** The sole construction point for the Toolpath TypeScript SDK in this application. */
export const createEngineClient = (apiKey: string) =>
  createToolpath({ apiKey, baseUrl: apiBaseUrl(), fetch: engineFetch }).api

export const requireData = <T>(
  result: { data?: T; error?: unknown; response: Response },
  operation: string,
): T => {
  if (result.data) return result.data
  throw new EngineError(result.response.status, 'engine_request_failed', operation)
}

export const getPartReport = async (
  apiKey: string,
  partId: string,
  jobId: string | null,
): Promise<PartReport | null> => {
  const result = await createEngineClient(apiKey).GET('/v1/parts/{id}/report', {
    params: { path: { id: partId }, query: jobId ? { jobId } : undefined },
  })
  if (result.data) return result.data as unknown as PartReport
  if (result.response.status === 404) return null
  throw new EngineError(result.response.status, 'engine_request_failed', 'get report')
}

/**
 * Engine omits datasheets from reports so large reports stay reasonably sized.
 * Fetch those measurements in URL-safe batches and put them back on their
 * report feature before sending the report to the browser.
 */
export const getWholePartReport = async (
  apiKey: string,
  partId: string,
  jobId: string | null,
): Promise<PartReport | null> => {
  const report = await getPartReport(apiKey, partId, jobId)
  if (!report) return null

  const missingIds = report.features.flatMap((feature) =>
    feature.datasheet || typeof feature.featureId !== 'string' ? [] : [feature.featureId],
  )
  if (missingIds.length === 0) return report

  const datasheetsByTag = new Map<string, NonNullable<PartFeature['datasheet']>>()
  const engine = createEngineClient(apiKey)
  for (let index = 0; index < missingIds.length; index += DATASHEET_BATCH_SIZE) {
    const ids = missingIds.slice(index, index + DATASHEET_BATCH_SIZE)
    const datasheets = requireData(
      await engine.GET('/v1/features/datasheets', { params: { query: { ids: ids.join(',') } } }),
      'get feature datasheets',
    )
    for (const entry of datasheets.datasheets) {
      if (entry.datasheet) datasheetsByTag.set(entry.featureTag, entry.datasheet)
    }
  }

  return {
    ...report,
    features: report.features.map((feature) =>
      feature.datasheet
        ? feature
        : { ...feature, datasheet: datasheetsByTag.get(feature.featureTag) ?? null },
    ),
  }
}
