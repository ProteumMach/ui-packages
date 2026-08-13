import { zValidator } from '@hono/zod-validator'
import type { Hono } from 'hono'
import { z } from 'zod'
import { clearConnection, readApiKey, setConnection } from '../connection'
import type { AppEnv } from '../types'

const connectSchema = z.object({ apiKey: z.string().trim().min(1, 'Enter an API key to connect.') })

export const registerSessionRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/session', async (c) => c.json({ connected: Boolean(await readApiKey(c)) }))

  app.post('/api/session', zValidator('json', connectSchema), async (c) => {
    await setConnection(c, c.req.valid('json').apiKey)
    return c.json({ connected: true }, 201)
  })

  app.delete('/api/session', (c) => {
    clearConnection(c)
    return c.body(null, 204)
  })
}
