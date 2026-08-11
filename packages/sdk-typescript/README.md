# Toolpath TypeScript SDK

Async SDK for the Toolpath Engine API.

```typescript
import { createToolpath } from '@toolpath/api'

const toolpath = createToolpath({
  apiKey: process.env.TOOLPATH_API_KEY!,
  baseUrl: 'https://api.toolpath.com',
})

const report = await toolpath.analyzePart('/path/to/part.step')
```

`Toolpath` is the stable, hand-written workflow façade. Its `api` property is the raw OpenAPI client;
`createToolpathClient()` remains available for lower-level requests. The generated schema lives in
`src/generated/schema.ts` and must not be edited by hand.
