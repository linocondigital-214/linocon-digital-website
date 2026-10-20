import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// On Vercel the files in /api run as serverless functions. This plugin runs
// the same files during `npm run dev`, saving to memory instead of Redis, so
// the client progress and finance pages work locally (passwords: "preview").
function localApi() {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      process.env.LCD_MEMORY_STORE ??= '1'
      process.env.FINANCE_PASSWORD ??= 'preview'
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const match = url.pathname.match(/^\/api\/(clients|client|finance|admin|portal)$/)
        if (!match) return next()

        let raw = ''
        for await (const chunk of req) raw += chunk
        req.body = raw ? JSON.parse(raw) : undefined
        req.query = Object.fromEntries(url.searchParams)
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        const { default: handler } = await server.ssrLoadModule(`/api/${match[1]}.js`)
        await handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
})
