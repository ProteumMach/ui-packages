import { basename, resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'
import { createToolpathClient } from '@toolpath/api'

interface AnalyzePartOptions {
  apiKey: string
  apiUrl?: string
  fetch?: typeof globalThis.fetch
  pollIntervalMs?: number
  onStatus?: (message: string) => void
}

const problemMessage = (error: unknown): string =>
  JSON.stringify(error, null, 2) ?? 'Unknown API error'

export const analyzePart = async (
  filePath: string,
  {
    apiKey,
    apiUrl = 'https://api.toolpath.com',
    fetch = globalThis.fetch,
    pollIntervalMs = 2_000,
    onStatus = console.error,
  }: AnalyzePartOptions,
): Promise<unknown> => {
  const file = await readFile(filePath)
  const client = createToolpathClient({ apiKey, baseUrl: apiUrl, fetch })
  const created = await client.POST('/v1/parts', {
    params: { query: { filename: basename(filePath) } },
  })

  if (!created.data) {
    throw new Error(`Could not create the part: ${problemMessage(created.error)}`)
  }

  const uploaded = await fetch(created.data.uploadUrl, {
    method: 'PUT',
    body: new Blob([file]),
  })
  if (!uploaded.ok) {
    throw new Error(`Could not upload the part: HTTP ${uploaded.status}`)
  }

  const analysis = await client.POST('/v1/parts/{id}/analyze', {
    params: {
      path: { id: created.data.partId },
      header: { 'Idempotency-Key': randomUUID() },
    },
  })
  if (!analysis.data) {
    throw new Error(`Could not start analysis: ${problemMessage(analysis.error)}`)
  }

  onStatus(`Analysis started as job ${analysis.data.jobId}`)
  for (;;) {
    const report = await client.GET('/v1/parts/{id}/report', {
      params: {
        path: { id: created.data.partId },
        query: { jobId: analysis.data.jobId },
      },
    })

    if (report.data) {
      return report.data
    }
    if (report.response.status !== 404) {
      throw new Error(`Could not get the report: ${problemMessage(report.error)}`)
    }

    onStatus('Waiting for the report...')
    await new Promise((resolvePoll) => setTimeout(resolvePoll, pollIntervalMs))
  }
}

const run = async (): Promise<void> => {
  const filePath = process.argv[2]
  const apiKey = process.env.TOOLPATH_API_KEY
  if (!filePath || !apiKey) {
    throw new Error('Usage: TOOLPATH_API_KEY=... pnpm analyze -- /absolute/path/to/part.step')
  }

  const report = await analyzePart(resolve(filePath), {
    apiKey,
    apiUrl: process.env.TOOLPATH_API_URL,
  })
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await run()
}
