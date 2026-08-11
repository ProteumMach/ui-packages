import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const preset = require('../tailwind-preset.cjs')
const packageRoot = process.cwd()

describe('@toolpath/ui/tailwind-preset', () => {
  it('generates package utilities from the published bundle', async () => {
    const bundle = await readFile(join(packageRoot, 'dist/index.js'), 'utf8')
    expect(bundle).toContain('bg-primary')

    const result = await postcss([
      tailwindcss({
        presets: [preset],
        content: [{ raw: bundle, extension: 'js' }],
      }),
    ]).process('@tailwind utilities;', { from: undefined })

    expect(result.css).toContain('.bg-primary')
    expect(result.css).toContain('.hide-scrollbar')
    expect(result.css).toContain('.dark\\:bg-zinc-900')
  })
})
