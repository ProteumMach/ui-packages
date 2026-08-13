import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import handle from 'hono-react-router-adapter/node'
import type { ServerBuild } from 'react-router'
import app from './index'

app.use('*', serveStatic({ root: './build/client' }))

const buildPath = '../build/server/index.js'
const build = (await import(buildPath)) as unknown as ServerBuild
const handler = handle(build, app)
const port = Number(process.env.PORT ?? 3000)

serve({ fetch: handler.fetch, port })
