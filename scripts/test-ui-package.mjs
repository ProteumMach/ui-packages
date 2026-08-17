import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { repositoryRoot, run } from './lib.mjs'

const uiRoot = join(repositoryRoot, 'packages/ui')
const fixtureRoot = await mkdtemp(join(tmpdir(), 'toolpath-ui-package-'))

try {
  const packed = await run('npm', ['pack', '--json', '--pack-destination', fixtureRoot], uiRoot, {
    capture: true,
    quiet: true,
  })
  const [{ filename }] = JSON.parse(packed.stdout)
  const packageFile = join(fixtureRoot, filename)

  const archive = await run('tar', ['-tzf', packageFile], fixtureRoot, {
    capture: true,
    quiet: true,
  })
  for (const entry of [
    'package/theme.css',
    'package/dist/index.js',
    'package/dist/index.d.ts',
    'package/src/index.ts',
  ]) {
    if (!archive.stdout.includes(entry)) {
      throw new Error(`Published UI package is missing ${entry}`)
    }
  }
} finally {
  await rm(fixtureRoot, { recursive: true, force: true })
}

process.stdout.write('Verified the packed Tailwind v4 UI package\n')
