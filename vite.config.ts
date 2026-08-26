import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * `vite dev` has no serverless runtime, so /api/* would 404 and the subscribe
 * field could only be tested on Vercel. This mounts the same handler in the
 * dev server — real Brevo call, real success/failure modal. Dev only; in
 * production Vercel serves api/ itself.
 */
function apiRoutes(mode: string): Plugin {
  return {
    name: 'dev-api-routes',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

      server.middlewares.use('/api/subscribe', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)

        const { default: handler } = await server.ssrLoadModule(
          '/api/subscribe.ts',
        )
        await handler(
          { method: req.method, body: Buffer.concat(chunks).toString() },
          {
            status(code: number) {
              res.statusCode = code
              return this
            },
            json(body: unknown) {
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify(body))
            },
          },
        )
      })

      server.middlewares.use('/api/issue', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/issue.ts')
        await handler(
          { method: req.method, url: req.originalUrl ?? req.url },
          {
            status(code: number) {
              res.statusCode = code
              return this
            },
            setHeader(name: string, value: string) {
              res.setHeader(name, value)
            },
            send(body: string) {
              res.end(body)
            },
            json(body: unknown) {
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify(body))
            },
          },
        )
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), apiRoutes(mode)],
}))
