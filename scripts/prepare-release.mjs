import { createHash } from 'node:crypto'
import { access, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { repositoryRoot } from './lib.mjs'

const releasePackage = process.env.RELEASE_PACKAGE ?? process.argv[2]
if (releasePackage !== 'sdk') {
  throw new Error('Set RELEASE_PACKAGE to sdk')
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
  const [typescriptPackage, pythonConfig] = await Promise.all([
    readFile(join(repositoryRoot, 'packages/sdk-typescript/package.json'), 'utf8').then(JSON.parse),
    readFile(join(repositoryRoot, 'codegen/python.yaml'), 'utf8'),
  ])
  version = typescriptPackage.version
  const pythonVersion = pythonConfig.match(/^package_version_override:\s*(.+)$/m)?.[1]?.trim()
  if (pythonVersion !== version) {
    throw new Error('The TypeScript and Python SDK versions must match')
  }
  files.push(
    join(artifactsRoot, `toolpath-api-${version}.tgz`),
    join(artifactsRoot, `toolpath-${version}-py3-none-any.whl`),
  )
  registryUrls.push(
    `https://registry.npmjs.org/${encodeURIComponent('@toolpath/api')}/${version}`,
    `https://pypi.org/pypi/toolpath/${version}/json`,
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
