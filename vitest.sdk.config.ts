import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@toolpath/api': fileURLToPath(
        new URL('./packages/sdk-typescript/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/typescript/**/*.test.ts'],
  },
})
