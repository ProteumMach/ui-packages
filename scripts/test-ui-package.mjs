import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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

  await writeFile(
    join(fixtureRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'toolpath-ui-package-fixture',
        private: true,
        type: 'module',
        dependencies: {
          '@toolpath/ui': `file:${packageFile}`,
          react: '^19.2.0',
          'react-dom': '^19.2.0',
          tailwindcss: '^3.4.17',
        },
      },
      null,
      2,
    )}\n`,
  )
  await writeFile(
    join(fixtureRoot, 'tailwind.config.cjs'),
    `const path = require('node:path')
const toolpathUiRoot = path.dirname(require.resolve('@toolpath/ui/package.json'))

module.exports = {
  presets: [require('@toolpath/ui/tailwind-preset')],
  content: [path.join(toolpathUiRoot, 'dist/**/*.{js,mjs}')],
}
`,
  )
  await writeFile(join(fixtureRoot, 'input.css'), '@tailwind utilities;\n')

  await run('pnpm', ['install', '--ignore-scripts', '--no-lockfile'], fixtureRoot, {
    quiet: true,
  })
  await run(
    'pnpm',
    [
      'exec',
      'tailwindcss',
      '--config',
      'tailwind.config.cjs',
      '--input',
      'input.css',
      '--output',
      'output.css',
    ],
    fixtureRoot,
    { quiet: true },
  )

  const css = await readFile(join(fixtureRoot, 'output.css'), 'utf8')
  for (const selector of ['.bg-primary', '.hide-scrollbar', '.dark\\:bg-zinc-900']) {
    if (!css.includes(selector)) {
      throw new Error(`Published UI package did not generate ${selector}`)
    }
  }
} finally {
  await rm(fixtureRoot, { recursive: true, force: true })
}

process.stdout.write('Verified the packed UI package in a fresh React and Tailwind fixture\n')
