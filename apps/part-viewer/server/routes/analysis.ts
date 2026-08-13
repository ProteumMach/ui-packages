import { zValidator } from '@hono/zod-validator'
import type { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import { toPublicInspectionReport, type AnalysisEvent } from '../../app/shared/contracts'
import {
  EngineError,
  createEngineClient,
  getWholePartReport,
  publicEngineErrorMessage,
  requireData,
} from '../engine'
import { requireApiKey } from '../connection'
import type { AppEnv } from '../types'

const POLL_INTERVAL_MS = 2_000
const paramsSchema = z.object({ partId: z.string().min(1) })
const querySchema = z.object({ jobId: z.string().min(1) })

const readAnalysis = async (
  apiKey: string,
  partId: string,
  jobId: string,
): Promise<AnalysisEvent> => {
  const job = requireData(
    await createEngineClient(apiKey).GET('/v1/jobs/{id}', { params: { path: { id: jobId } } }),
    'get analysis status',
  )
  if (job.status === 'failed') {
    return {
      status: 'failed',
      message: job.error ?? 'The Toolpath Engine could not analyze this part.',
    }
  }
  if (job.status !== 'succeeded') {
    return {
      status: 'pending',
      progress: job.progress,
      message: job.status === 'running' ? 'Analyzing geometry…' : 'Analysis is queued…',
    }
  }
  const report = await getWholePartReport(apiKey, partId, jobId)
  if (!report) return { status: 'pending', progress: job.progress, message: 'Finalizing report…' }
  return { status: 'ready', report: toPublicInspectionReport(report) }
}

export const registerAnalysisRoutes = (app: Hono<AppEnv>) => {
  app.get(
    '/api/parts/:partId/events',
    zValidator('param', paramsSchema),
    zValidator('query', querySchema),
    async (c) => {
      const apiKey = await requireApiKey(c)
      const { partId } = c.req.valid('param')
      const { jobId } = c.req.valid('query')

      return streamSSE(c, async (stream) => {
        try {
          // The browser always consumes this app-owned SSE stream. Until Engine exposes its own
          // analysis-event endpoint, this loop polls the SDK's job endpoint and forwards its
          // normalized states. Replace this loop with an Engine SSE subscription when available;
          // keep the events emitted below so the React client does not need to change.
          while (!stream.aborted) {
            const event = await readAnalysis(apiKey, partId, jobId)
            await stream.writeSSE({ event: 'analysis', data: JSON.stringify(event) })
            if (event.status !== 'pending') return
            await stream.sleep(POLL_INTERVAL_MS)
          }
        } catch (error) {
          if (stream.aborted) return
          const message =
            error instanceof EngineError
              ? publicEngineErrorMessage(error.status)
              : 'Could not monitor this analysis. Try opening the part again.'
          await stream.writeSSE({
            event: 'analysis',
            data: JSON.stringify({ status: 'failed', message } satisfies AnalysisEvent),
          })
        }
      })
    },
  )
}

export { readAnalysis }
