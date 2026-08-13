import { createToolpath } from '@toolpath/api'
import type { PartReport } from '../app/shared/contracts'

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
