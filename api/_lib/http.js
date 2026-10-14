import { createHash, timingSafeEqual } from 'node:crypto'
import { SetupError } from './store.js'

const digest = (value) => createHash('sha256').update(String(value)).digest()

// Lino's editor sends the password from the ADMIN_PASSWORD environment
// variable (set in Vercel) with every change.
export function isAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD
  const given = req.headers['x-admin-password']
  if (!expected) throw new SetupError('ADMIN_PASSWORD is not set')
  return Boolean(given) && timingSafeEqual(digest(given), digest(expected))
}

// Runs a handler and turns errors into JSON the pages can explain.
export function route(handler) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', 'noindex')
    try {
      const [status, body] = await handler(req)
      res.status(status).json(body)
    } catch (err) {
      if (err instanceof SetupError) {
        res.status(503).json({ error: 'setup', message: err.message })
      } else {
        console.error(err)
        res.status(500).json({ error: 'server', message: 'Something went wrong' })
      }
    }
  }
}
