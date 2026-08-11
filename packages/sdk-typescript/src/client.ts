import createClient, { type Client } from 'openapi-fetch'

import type { paths } from './generated/schema.js'

export interface ToolpathClientOptions {
  apiKey: string
  baseUrl?: string
  fetch?: typeof globalThis.fetch
}

export type ToolpathClient = Client<paths>

export const createToolpathClient = ({
  apiKey,
  baseUrl = 'https://api.toolpath.com',
  fetch,
}: ToolpathClientOptions): ToolpathClient =>
  createClient<paths>({
    baseUrl,
    fetch,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
