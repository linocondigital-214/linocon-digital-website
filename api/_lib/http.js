import { SetupError } from './store.js'
import { checkSetup, currentUser } from './finance/auth.js'

// Lino's client admin (/admin) uses the same sign-in as the finance app:
// the FINANCE_PASSWORD plus a code from the authenticator app. See api/admin.js.
export async function isAdmin(req) {
  checkSetup()
  const user = await currentUser(req, 'admin')
  return user?.role === 'owner'
}

// Runs a handler and turns errors into JSON the pages can explain.
export function route(handler) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    try {
      // Changes only accept JSON, which other sites can't send here.
      if (['POST', 'PATCH'].includes(req.method) && !String(req.headers['content-type'] ?? '').startsWith('application/json')) {
        res.status(415).json({ error: 'json' })
        return
      }
      const [status, body] = await handler(req, res)
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
