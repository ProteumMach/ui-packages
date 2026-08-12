import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { assertInsideRepository, repositoryRoot, run } from './lib.mjs'

const artifactsRoot = join(repositoryRoot, 'artifacts')
const files = await readdir(artifactsRoot)
const pythonWheel = files.find((name) => name.endsWith('.whl'))
const typescriptTarball = files.find((name) => name.endsWith('.tgz'))
if (!pythonWheel || !typescriptTarball) {
  throw new Error('SDK packages are missing. Run pnpm build before pnpm test.')
}

const testRoot = assertInsideRepository(join(repositoryRoot, '.tmp/sdk-tests'))
const pythonEnvironment = join(testRoot, 'python')
const pythonExecutable = join(pythonEnvironment, 'bin/python')
const typescriptEnvironment = join(testRoot, 'typescript')
await rm(testRoot, { recursive: true, force: true })
await mkdir(typescriptEnvironment, { recursive: true })

await run('uv', ['venv', '--python', '3.11', pythonEnvironment])
await run('uv', ['pip', 'install', '--python', pythonExecutable, join(artifactsRoot, pythonWheel)])
await run(pythonExecutable, [
  '-m',
  'unittest',
  'discover',
  '--start-directory',
  join(repositoryRoot, 'tests/python'),
  '--pattern',
  'test_*.py',
  '--verbose',
])

await writeFile(
  join(typescriptEnvironment, 'package.json'),
  `${JSON.stringify(
    {
      private: true,
      type: 'module',
      dependencies: {
        '@toolpath/api': `file:${relative(
          typescriptEnvironment,
          join(artifactsRoot, typescriptTarball),
        )}`,
      },
    },
    null,
    2,
  )}\n`,
  'utf8',
)
await copyFile(
  join(repositoryRoot, 'tests/typescript/client.test.ts'),
  join(typescriptEnvironment, 'client.test.ts'),
)
await copyFile(
  join(repositoryRoot, 'tests/typescript/workflow.test.ts'),
  join(typescriptEnvironment, 'workflow.test.ts'),
)
await run('pnpm', ['install', '--ignore-workspace', '--no-lockfile'], typescriptEnvironment)
await run('pnpm', ['exec', 'vitest', 'run', '--root', typescriptEnvironment], repositoryRoot)

process.stdout.write('Clean-install SDK package tests passed\n')
