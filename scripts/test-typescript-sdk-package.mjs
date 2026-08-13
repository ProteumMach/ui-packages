import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { repositoryRoot, run } from './lib.mjs'

const packageRoot = join(repositoryRoot, 'packages/sdk-typescript')
const fixtureRoot = await mkdtemp(join(tmpdir(), 'toolpath-api-package-'))

try {
  const packed = await run(
    'npm',
    ['pack', '--json', '--pack-destination', fixtureRoot],
    packageRoot,
    {
      capture: true,
      quiet: true,
    },
  )
  const [{ filename }] = JSON.parse(packed.stdout)
  const packageFile = join(fixtureRoot, filename)

  await writeFile(
    join(fixtureRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'toolpath-api-package-fixture',
        private: true,
        type: 'module',
        dependencies: { '@toolpath/api': `file:${packageFile}` },
      },
      null,
      2,
    )}\n`,
  )
  await writeFile(
    join(fixtureRoot, 'verify.mjs'),
    `import { createToolpathClient, uploadToPresignedUrl } from '@toolpath/api'

const options = { apiKey: 'test-key', baseUrl: 'https://api.example.test' }
let apiRequest
const api = createToolpathClient({
  ...options,
  fetch: async (url, init) => {
    apiRequest = { url: String(url), init }
    return new Response(
      JSON.stringify({
        partId: 'part-123',
        uploadUrl: 'https://upload.example.test',
        sourceBucket: 'parts',
        sourceS3Key: 'part-123.step',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  },
})
const created = await api.parts.createPart({ filename: 'part.step' })
if (created.partId !== 'part-123') {
  throw new Error('createPart did not return the generated response type')
}
if (apiRequest.url !== 'https://api.example.test/v1/parts?filename=part.step') {
  throw new Error('createPart did not call the expected Engine API operation')
}
if (apiRequest.init.headers.Authorization !== 'Bearer test-key') {
  throw new Error('createPart did not authenticate the generated request')
}
if (typeof api.parts.createPart !== 'function') {
  throw new Error('createToolpathClient did not return named generated API clients')
}
let request
await uploadToPresignedUrl('https://upload.example.test', new Uint8Array([1, 2, 3]), {
  fetch: async (url, options) => {
    request = { url, options }
    return new Response(null, { status: 200 })
  },
})
if (request.url !== 'https://upload.example.test' || request.options.method !== 'PUT') {
  throw new Error('uploadToPresignedUrl did not make a PUT request to the presigned URL')
}
`,
  )
  await writeFile(
    join(fixtureRoot, 'consumer.ts'),
    `import { createToolpathClient, uploadToPresignedUrl, type ToolpathClient } from '@toolpath/api'

const client: ToolpathClient = createToolpathClient({ apiKey: 'test-key' })
void client
void client.parts.createPart({ filename: 'part.step' })
void uploadToPresignedUrl('https://upload.example.test', new Uint8Array())
`,
  )
  await writeFile(
    join(fixtureRoot, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noEmit: true,
          strict: true,
          target: 'ES2022',
        },
        include: ['consumer.ts'],
      },
      null,
      2,
    )}\n`,
  )

  await run('npm', ['install', '--ignore-scripts', '--no-package-lock'], fixtureRoot, {
    quiet: true,
  })
  await run('node', ['verify.mjs'], fixtureRoot, { quiet: true })
  await run(
    process.execPath,
    [join(repositoryRoot, 'node_modules/typescript/bin/tsc'), '--project', fixtureRoot],
    fixtureRoot,
    { quiet: true },
  )
} finally {
  await rm(fixtureRoot, { recursive: true, force: true })
}

process.stdout.write('Verified the packed TypeScript SDK in a fresh npm fixture\n')
