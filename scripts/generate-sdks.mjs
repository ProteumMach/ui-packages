import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { repositoryRoot, run } from './lib.mjs'

const openApiPath = join(repositoryRoot, 'openapi/openapi.json')
const typescriptRoot = join(repositoryRoot, 'packages/sdk-typescript')
const pythonRoot = join(repositoryRoot, 'packages/sdk-python')
const [openApiChecksum, releaseMetadata] = await Promise.all([
  readFile(join(repositoryRoot, 'openapi/openapi.sha256'), 'utf8'),
  readFile(join(repositoryRoot, 'openapi/release.json'), 'utf8').then(JSON.parse),
])
const openApiSha256 = openApiChecksum.trim().split(/\s+/)[0]

await run('pnpm', [
  'exec',
  'openapi-typescript',
  openApiPath,
  '--output',
  join(typescriptRoot, 'src/schema.ts'),
])
await run('uvx', [
  '--from',
  'openapi-python-client==0.29.0',
  'openapi-python-client',
  'generate',
  '--path',
  openApiPath,
  '--config',
  join(repositoryRoot, 'codegen/python.yaml'),
  '--meta',
  'uv',
  '--fail-on-warning',
  '--overwrite',
  '--output-path',
  pythonRoot,
])

const pyprojectPath = join(pythonRoot, 'pyproject.toml')
const pyproject = await readFile(pyprojectPath, 'utf8')
const typescriptPackagePath = join(typescriptRoot, 'package.json')
const typescriptPackage = JSON.parse(await readFile(typescriptPackagePath, 'utf8'))
const packageMetadata = `${pyproject
  .replace('authors = []', 'authors = [{ name = "Toolpath" }]')
  .replace('readme = "README.md"', 'readme = "README.md"\nlicense = { file = "LICENSE" }')}

[project.urls]
Homepage = "https://developers.toolpath.com"
Repository = "https://github.com/toolpath/toolpath"
Issues = "https://github.com/toolpath/toolpath/issues"

[tool.toolpath]
openapi-sha256 = "${openApiSha256}"
openapi-version = "${releaseMetadata.apiVersion}"
`
typescriptPackage.toolpath = {
  openApiSha256,
  openApiVersion: releaseMetadata.apiVersion,
}
await Promise.all([
  writeFile(pyprojectPath, packageMetadata, 'utf8'),
  writeFile(typescriptPackagePath, `${JSON.stringify(typescriptPackage, null, 2)}\n`, 'utf8'),
  copyFile(join(repositoryRoot, 'LICENSE'), join(pythonRoot, 'LICENSE')),
  copyFile(join(repositoryRoot, 'LICENSE'), join(typescriptRoot, 'LICENSE')),
  copyFile(join(repositoryRoot, 'codegen/python-readme.md'), join(pythonRoot, 'README.md')),
])

process.stdout.write('Generated TypeScript and Python SDK source\n')
