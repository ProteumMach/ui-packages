import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { analyzePart } from './analyze-part.js'

test('runs the complete analysis workflow', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'toolpath-example-'))
  const filePath = join(directory, 'fixture.step')
  await writeFile(filePath, 'STEP fixture')
  const requests: Array<Request> = []
  let reportAttempts = 0

  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    requests.push(request)
    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname === '/v1/parts') {
      expect(request.headers.get('Authorization')).toBe('Bearer test-key')
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
    if (request.method === 'PUT' && url.hostname === 'uploads.example.test') {
      expect(request.headers.get('Authorization')).toBeNull()
      expect(await request.text()).toBe('STEP fixture')
      return new Response(null, { status: 200 })
    }
    if (request.method === 'POST' && url.pathname.endsWith('/analyze')) {
      return Response.json({ jobId: 'job-1', partId: 'part-1', status: 'queued' }, { status: 202 })
    }
    if (request.method === 'GET' && url.pathname.endsWith('/report')) {
      reportAttempts += 1
      if (reportAttempts === 1) {
        return Response.json(
          {
            type: 'https://api.toolpath.com/problems/report-not-found',
            title: 'Part report not found',
            status: 404,
            code: 'report_not_found',
          },
          { status: 404 },
        )
      }
      return Response.json({
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
      })
    }

    throw new Error(`Unexpected request: ${request.method} ${request.url}`)
  }

  try {
    const report = await analyzePart(filePath, {
      apiKey: 'test-key',
      apiUrl: 'https://api.example.test',
      fetch,
      pollIntervalMs: 0,
      onStatus: () => undefined,
    })
    expect(report).toEqual({
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
    })
    expect(requests).toHaveLength(5)
  } finally {
    await rm(directory, { recursive: true })
  }
})
