import { createToolpathClient } from '@toolpath/api'
import { expect, test } from 'vitest'

test('the installed package authenticates requests and decodes responses', async () => {
  const requests: Request[] = []
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init)
    requests.push(request)
    expect(request.headers.get('Authorization')).toBe('Bearer sdk-test-key')

    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/v1/parts') {
      expect(url.searchParams.get('filename')).toBe('fixture.step')
      return Response.json(
        {
          partId: 'part-1',
          uploadUrl: 'https://uploads.example.test/part-1',
          sourceBucket: 'parts',
          sourceS3Key: 'parts/part-1/source.step',
        },
        { status: 201 },
      )
    }

    if (request.method === 'GET' && url.pathname === '/v1/parts/missing/report') {
      return Response.json(
        {
          type: 'https://api.toolpath.com/problems/report-not-found',
          title: 'Part report not found',
          status: 404,
          code: 'report_not_found',
        },
        {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json' },
        },
      )
    }

    throw new Error(`Unexpected request: ${request.method} ${request.url}`)
  }

  const client = createToolpathClient({ apiKey: 'sdk-test-key', fetch })
  const created = await client.POST('/v1/parts', {
    params: { query: { filename: 'fixture.step' } },
  })
  expect(created.data?.partId).toBe('part-1')
  expect(created.error).toBeUndefined()

  const problem = await client.GET('/v1/parts/{id}/report', {
    params: { path: { id: 'missing' } },
  })
  expect(problem.data).toBeUndefined()
  expect(problem.error?.code).toBe('report_not_found')
  expect(requests).toHaveLength(2)
})
