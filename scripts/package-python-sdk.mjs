import { access, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { assertInsideRepository, repositoryRoot, run } from './lib.mjs'

const artifactsRoot = assertInsideRepository(join(repositoryRoot, 'artifacts'))
const packageRoot = join(repositoryRoot, 'packages/sdk-python')
const pythonConfig = await readFile(join(repositoryRoot, 'codegen/python.yaml'), 'utf8')
const version = pythonConfig.match(/^package_version_override:\s*(.+)$/m)?.[1]?.trim()
if (!version) {
  throw new Error('Python generator config does not declare package_version_override')
}
const packageFile = join(artifactsRoot, `toolpath-${version}-py3-none-any.whl`)

await Promise.all([mkdir(artifactsRoot, { recursive: true }), rm(packageFile, { force: true })])

await run('uv', [
  'build',
  '--wheel',
  '--out-dir',
  artifactsRoot,
  '--no-create-gitignore',
  packageRoot,
])
await access(packageFile)

process.stdout.write(`Packaged Python SDK in ${artifactsRoot}\n`)
