import type { Config } from '@react-router/dev/config'

export default {
  // Hono owns API requests; hono-react-router-adapter renders this SSR application.
  ssr: true,
} satisfies Config
