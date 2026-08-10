# Toolpath TypeScript SDK

Generated TypeScript client for the Toolpath Engine API.

```typescript
import { createToolpathClient } from '@toolpath/api'

const client = createToolpathClient({
  apiKey: process.env.TOOLPATH_API_KEY!,
  baseUrl: 'https://api.toolpath.com',
})
```

See <https://developers.toolpath.com> for authentication and workflow documentation. This package is
generated from the versioned OpenAPI input retained in this repository; do not edit
`src/schema.ts` by hand.
