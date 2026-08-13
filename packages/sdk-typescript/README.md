# Toolpath TypeScript SDK

TypeScript bindings and a presigned-upload helper for the Toolpath Engine API.

## Install

```bash
npm install @toolpath/api
```

The SDK is ESM-only and supports Node.js 20 and newer.

```typescript
import { readFile } from 'node:fs/promises'
import { createToolpathClient, uploadToPresignedUrl } from '@toolpath/api'

const api = createToolpathClient({
  apiKey: process.env.TOOLPATH_API_KEY!,
  baseUrl: 'https://api.toolpath.com',
})
const filePath = '/path/to/part.step'
const created = await api.parts.createPart({ filename: 'part.step' })

await uploadToPresignedUrl(created.data.uploadUrl, await readFile(filePath))
```

Use `createToolpathClient()` for every Engine API operation. It returns named generated APIs such as
`parts.createPart()` and `jobs.getJob()`. `uploadToPresignedUrl()` performs the direct PUT after the
create-part operation returns its upload URL. Generated code lives in `src/generated` and must not be
edited by hand.
