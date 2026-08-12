import { access, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { assertInsideRepository, repositoryRoot, run } from './lib.mjs'

const artifactsRoot = assertInsideRepository(join(repositoryRoot, 'artifacts'))
const viewerRoot = join(repositoryRoot, 'packages/viewer')
const viewerDist = assertInsideRepository(join(viewerRoot, 'dist'))
const packageJson = JSON.parse(await readFile(join(viewerRoot, 'package.json'), 'utf8'))
const packageFile = join(artifactsRoot, `toolpath-viewer-${packageJson.version}.tgz`)

await Promise.all([
  mkdir(artifactsRoot, { recursive: true }),
  rm(viewerDist, { recursive: true, force: true }),
  rm(packageFile, { force: true }),
])

await run('pnpm', ['build'], viewerRoot)
await run('pnpm', ['pack', '--out', packageFile], viewerRoot, { capture: true })
await access(packageFile)

process.stdout.write(`Built viewer package in ${artifactsRoot}\n`)
