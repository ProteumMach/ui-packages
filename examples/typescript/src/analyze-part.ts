import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createToolpath } from '@toolpath/api'

interface AnalyzePartOptions {
  apiKey: string
  apiUrl?: string
  fetch?: typeof globalThis.fetch
  pollIntervalMs?: number
  onStatus?: (message: string) => void
}

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
  const toolpath = createToolpath({ apiKey, baseUrl: apiUrl, fetch })
  return toolpath.analyzePart(filePath, { pollIntervalMs, onStatus })
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
