import { access, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { assertInsideRepository, repositoryRoot, run } from './lib.mjs'

const artifactsRoot = assertInsideRepository(join(repositoryRoot, 'artifacts'))
const uiRoot = join(repositoryRoot, 'packages/ui')
const uiDist = assertInsideRepository(join(uiRoot, 'dist'))
const packageJson = JSON.parse(await readFile(join(uiRoot, 'package.json'), 'utf8'))
const packageFile = join(artifactsRoot, `toolpath-ui-${packageJson.version}.tgz`)

await Promise.all([
  mkdir(artifactsRoot, { recursive: true }),
  rm(uiDist, { recursive: true, force: true }),
  rm(packageFile, { force: true }),
])

await run('pnpm', ['build'], uiRoot)
await run('pnpm', ['pack', '--out', packageFile], uiRoot, { capture: true })
await access(packageFile)

process.stdout.write(`Built UI package in ${artifactsRoot}\n`)
