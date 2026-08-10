import { access, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { assertInsideRepository, repositoryRoot, run } from './lib.mjs'

const artifactsRoot = assertInsideRepository(join(repositoryRoot, 'artifacts'))
const typescriptRoot = join(repositoryRoot, 'packages/sdk-typescript')
const pythonRoot = join(repositoryRoot, 'packages/sdk-python')
const typescriptDist = assertInsideRepository(join(typescriptRoot, 'dist'))
const packageJson = JSON.parse(await readFile(join(typescriptRoot, 'package.json'), 'utf8'))
const pythonConfig = await readFile(join(repositoryRoot, 'codegen/python.yaml'), 'utf8')
const pythonVersion = pythonConfig.match(/^package_version_override:\s*(.+)$/m)?.[1]?.trim()
if (!pythonVersion) {
  throw new Error('Python generator config does not declare package_version_override')
}

await Promise.all([
  rm(artifactsRoot, { recursive: true, force: true }),
  rm(typescriptDist, { recursive: true, force: true }),
])
await mkdir(artifactsRoot, { recursive: true })

await run('pnpm', ['build'], typescriptRoot)
await run(
  'pnpm',
  ['pack', '--out', join(artifactsRoot, `toolpath-api-${packageJson.version}.tgz`)],
  typescriptRoot,
  { capture: true },
)
await run('uv', [
  'build',
  '--wheel',
  '--out-dir',
  artifactsRoot,
  '--no-create-gitignore',
  pythonRoot,
])

await Promise.all([
  access(join(artifactsRoot, `toolpath-api-${packageJson.version}.tgz`)),
  access(join(artifactsRoot, `toolpath-${pythonVersion}-py3-none-any.whl`)),
])
process.stdout.write(`Built SDK packages in ${artifactsRoot}\n`)
