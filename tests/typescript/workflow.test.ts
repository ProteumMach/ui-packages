import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createToolpath, ToolpathWorkflowError } from '@toolpath/api'
import { expect, test } from 'vitest'

const report = {
  partId: 'part-1',
  reportId: 'report-1',
  jobId: 'job-1',
  kernelVersion: 'test',
  units: { length: 'mm', angle: 'rad' },
  regions: [],
  features: [],
  candidateDirections: [],
  meshPointCount: 0,
  meshTriangleCount: 0,
  thumbnailUrl: null,
  meshStlUrl: null,
  meshGlbUrl: null,
  downloadMs: 1,
  analysisMs: 2,
  totalMs: 3,
}

test('the installed package runs the async analysis workflow', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'toolpath-sdk-'))
  const filePath = join(directory, 'fixture.step')
  await writeFile(filePath, 'STEP fixture')
  let reportAttempts = 0
  const statuses: string[] = []
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/v1/parts') {
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
    if (request.method === 'PUT') {
      expect(await request.text()).toBe('STEP fixture')
      return new Response(null, { status: 200 })
    }
    if (request.method === 'POST' && url.pathname.endsWith('/analyze')) {
      expect(request.headers.get('Idempotency-Key')).toBeTruthy()
      return Response.json({ jobId: 'job-1', partId: 'part-1', status: 'queued' }, { status: 202 })
    }
    if (request.method === 'GET' && url.pathname.endsWith('/report')) {
      reportAttempts += 1
      return reportAttempts === 1
        ? Response.json(
            {
              type: 'https://api.toolpath.com/problems/report-not-found',
              title: 'Part report not found',
              status: 404,
              code: 'report_not_found',
            },
            { status: 404 },
          )
        : Response.json(report)
    }
    throw new Error(`Unexpected request: ${request.method} ${request.url}`)
  }

  try {
    const toolpath = createToolpath({
      apiKey: 'sdk-test-key',
      baseUrl: 'https://api.example.test',
      fetch,
    })
    const actual = await toolpath.analyzePart(filePath, {
      pollIntervalMs: 0,
      onStatus: (status) => statuses.push(status),
    })
    expect(actual).toEqual(report)
    expect(statuses).toEqual(['Analysis started as job job-1', 'Waiting for the report...'])
    expect(toolpath.api).toBeDefined()
  } finally {
    await rm(directory, { recursive: true })
  }
})

for (const stage of ['create', 'upload', 'analyze', 'report']) {
  test(`the workflow identifies ${stage} failures`, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'toolpath-sdk-'))
    const filePath = join(directory, 'fixture.step')
    await writeFile(filePath, 'STEP fixture')
    const fetch: typeof globalThis.fetch = async (input, init) => {
      const request = new Request(input, init)
      const url = new URL(request.url)
      if (request.method === 'POST' && url.pathname === '/v1/parts') {
        return stage === 'create'
          ? Response.json({ code: 'failed' }, { status: 500 })
          : Response.json(
              {
                partId: 'part-1',
                uploadUrl: 'https://uploads.example.test/part-1',
                sourceBucket: 'parts',
                sourceS3Key: 'parts/part-1/source.step',
              },
              { status: 201 },
            )
      }
      if (request.method === 'PUT')
        return new Response(null, { status: stage === 'upload' ? 500 : 200 })
      if (request.method === 'POST' && url.pathname.endsWith('/analyze'))
        return stage === 'analyze'
          ? Response.json({ code: 'failed' }, { status: 500 })
          : Response.json({ jobId: 'job-1', partId: 'part-1', status: 'queued' }, { status: 202 })
      if (request.method === 'GET') return Response.json({ code: 'failed' }, { status: 500 })
      throw new Error(`Unexpected request: ${request.method} ${request.url}`)
    }

    try {
      const toolpath = createToolpath({
        apiKey: 'sdk-test-key',
        baseUrl: 'https://api.example.test',
        fetch,
      })
      await expect(toolpath.analyzePart(filePath, { pollIntervalMs: 0 })).rejects.toMatchObject({
        name: ToolpathWorkflowError.name,
        stage,
      })
    } finally {
      await rm(directory, { recursive: true })
    }
  })
}
