import { access, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { assertInsideRepository, repositoryRoot, run } from './lib.mjs'

const artifactsRoot = assertInsideRepository(join(repositoryRoot, 'artifacts'))
const packageRoot = join(repositoryRoot, 'packages/sdk-typescript')
const distRoot = assertInsideRepository(join(packageRoot, 'dist'))
const packageJson = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
const packageFile = join(artifactsRoot, `toolpath-api-${packageJson.version}.tgz`)

await Promise.all([
  mkdir(artifactsRoot, { recursive: true }),
  rm(distRoot, { recursive: true, force: true }),
  rm(packageFile, { force: true }),
])

await run('pnpm', ['build'], packageRoot)
const packed = await run(
  'npm',
  ['pack', '--json', '--pack-destination', artifactsRoot],
  packageRoot,
  { capture: true, quiet: true },
)
const [{ filename }] = JSON.parse(packed.stdout)
if (filename !== `toolpath-api-${packageJson.version}.tgz`) {
  throw new Error(`npm packed an unexpected filename: ${filename}`)
}
await access(packageFile)

process.stdout.write(`Packaged TypeScript SDK in ${artifactsRoot}\n`)
