import { createHash } from 'node:crypto'
import { access, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { repositoryRoot } from './lib.mjs'

const releasePackage = process.env.RELEASE_PACKAGE ?? process.argv[2]
if (releasePackage !== 'sdk' && releasePackage !== 'ui' && releasePackage !== 'viewer') {
  throw new Error('Set RELEASE_PACKAGE to sdk, ui, or viewer')
}

const publishing = process.env.PUBLISH === 'true'
const refType = process.env.GITHUB_REF_TYPE
const refName = process.env.GITHUB_REF_NAME
const artifactsRoot = join(repositoryRoot, 'artifacts')
const releaseArtifactsRoot = join(repositoryRoot, 'release-artifacts')
const files = []
const registryUrls = []
let version

if (releasePackage === 'sdk') {
  const typescriptPackage = await readFile(
    join(repositoryRoot, 'packages/sdk-typescript/package.json'),
    'utf8',
  ).then(JSON.parse)
  version = typescriptPackage.version
  files.push(join(artifactsRoot, `toolpath-api-${version}.tgz`))
  registryUrls.push(`https://registry.npmjs.org/${encodeURIComponent('@toolpath/api')}/${version}`)
}

if (releasePackage === 'ui') {
  const uiPackage = JSON.parse(
    await readFile(join(repositoryRoot, 'packages/ui/package.json'), 'utf8'),
  )
  version = uiPackage.version
  files.push(join(artifactsRoot, `toolpath-ui-${version}.tgz`))
  registryUrls.push(`https://registry.npmjs.org/${encodeURIComponent('@toolpath/ui')}/${version}`)
}

if (releasePackage === 'viewer') {
  const viewerPackage = JSON.parse(
    await readFile(join(repositoryRoot, 'packages/viewer/package.json'), 'utf8'),
  )
  version = viewerPackage.version
  files.push(join(artifactsRoot, `toolpath-viewer-${version}.tgz`))
  registryUrls.push(
    `https://registry.npmjs.org/${encodeURIComponent('@toolpath/viewer')}/${version}`,
  )
}

const expectedTag = `${releasePackage}-v${version}`
if (publishing && (refType !== 'tag' || refName !== expectedTag)) {
  throw new Error(`Publishing ${releasePackage} ${version} requires tag ${expectedTag}`)
}
if (publishing) {
  for (const url of registryUrls) {
    const response = await fetch(url)
    if (response.ok) {
      throw new Error(`${releasePackage} ${version} is already published at ${url}`)
    }
    if (response.status !== 404) {
      throw new Error(`Could not verify package availability at ${url}: HTTP ${response.status}`)
    }
  }
}

await rm(releaseArtifactsRoot, { recursive: true, force: true })
await mkdir(releaseArtifactsRoot, { recursive: true })
const packages = []
for (const file of files) {
  await access(file)
  const contents = await readFile(file)
  await copyFile(file, join(releaseArtifactsRoot, basename(file)))
  packages.push({
    file: basename(file),
    sha256: createHash('sha256').update(contents).digest('hex'),
  })
}

const manifest = {
  package: releasePackage,
  version,
  expectedTag,
  commit: process.env.GITHUB_SHA ?? null,
  packages,
}
await writeFile(
  join(releaseArtifactsRoot, 'release-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
)
process.stdout.write(`Prepared ${releasePackage} ${version} (${packages.length} packages)\n`)
