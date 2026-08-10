import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createToolpathClient } from '@toolpath/api'

test('the installed package authenticates requests and decodes responses', async () => {
  const requests = []
  const fetch = async (request) => {
    requests.push(request)
    assert.equal(request.headers.get('Authorization'), 'Bearer sdk-test-key')

    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/v1/parts') {
      assert.equal(url.searchParams.get('filename'), 'fixture.step')
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
  assert.equal(created.data?.partId, 'part-1')
  assert.equal(created.error, undefined)

  const problem = await client.GET('/v1/parts/{id}/report', {
    params: { path: { id: 'missing' } },
  })
  assert.equal(problem.data, undefined)
  assert.equal(problem.error?.code, 'report_not_found')
  assert.equal(requests.length, 2)
})
