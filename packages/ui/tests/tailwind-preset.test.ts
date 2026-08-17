import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageRoot = process.cwd()

describe('@toolpath/ui/theme.css', () => {
  it('defines the public v4 theme and scans the component source', async () => {
    const bundle = await readFile(join(packageRoot, 'dist/index.js'), 'utf8')
    const theme = await readFile(join(packageRoot, 'theme.css'), 'utf8')

    expect(bundle).toContain('bg-primary')
    expect(theme).toContain("@source './src'")
    expect(theme).toContain('@custom-variant dark')
    expect(theme).toContain('--color-primary: #e07a48')
    expect(theme).toContain('--color-zinc-950: #282828')
  })
})
