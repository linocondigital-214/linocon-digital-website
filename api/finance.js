// /api/finance: Lino's private books (linocondigital.com/finance).
//   GET  ?op=status    signed in or not, and whether setup is finished
//   POST ?op=password  step 1 of sign-in
//   POST ?op=code      step 2: authenticator or recovery code
//   POST ?op=invite    a bookkeeper's first sign-in: invite code + their new password
//   POST ?op=signout
//   GET  ?op=summary   the dashboard numbers
// Expense calls are listed in _lib/finance/expenseOps.js, income and Stripe
// calls in _lib/finance/incomeOps.js, invoice calls in _lib/finance/invoiceOps.js,
// GST, year-end and settings calls in _lib/finance/booksOps.js, access calls
// in _lib/finance/accessOps.js.
import QRCode from 'qrcode'
import { SetupError } from './_lib/store.js'
import { acceptInvite, checkSetup, currentUser, finishSignIn, isEnrolled, recoveryCodesLeft, sessionCookie, signOut, startSignIn } from './_lib/finance/auth.js'
import { otpauthUrl } from './_lib/finance/totp.js'
import { can } from './_lib/finance/roles.js'
import { summarize } from './_lib/finance/summary.js'
import { Invalid, expenseOps } from './_lib/finance/expenseOps.js'
import { incomeOps } from './_lib/finance/incomeOps.js'
import { invoiceOps } from './_lib/finance/invoiceOps.js'
import { booksOps, loadBooks } from './_lib/finance/booksOps.js'
import { accessOps } from './_lib/finance/accessOps.js'
import { StripeProblem, getStripeState } from './_lib/finance/stripe.js'

const MESSAGES = {
  wrong: "That didn't match. Try again.",
  locked: 'Too many tries. Sign-in is paused for 15 minutes.',
  expired: 'That took too long. Start again with your password.',
  invite: 'That invite code didn’t work. Check it with the owner, or ask for a new one.',
  weak: 'Choose a password of at least 12 characters.',
}

async function handle(req, res) {
  const op = req.query?.op
  const post = req.method === 'POST'
  // Sign-in and changes only accept JSON, which other sites can't send here.
  if (post && !String(req.headers['content-type'] ?? '').startsWith('application/json')) return [415, { error: 'json' }]

  if (op === 'status' && req.method === 'GET') {
    checkSetup()
    const user = await currentUser(req)
    return [200, { signedIn: Boolean(user), role: user?.role ?? null, linked: await isEnrolled() }]
  }

  if (op === 'password' && post) {
    const result = await startSignIn(req, req.body?.password)
    if (result.status !== 'ok') return [result.status === 'locked' ? 429 : 401, { error: result.status, message: MESSAGES[result.status] }]
    const body = { ticket: result.ticket, link: result.enroll }
    if (result.enroll) {
      const url = otpauthUrl(result.secret)
      body.setup = { secret: result.secret, qr: await QRCode.toString(url, { type: 'svg', margin: 1 }) }
    }
    return [200, body]
  }

  if (op === 'invite' && post) {
    const result = await acceptInvite(req, req.body?.code, req.body?.password)
    if (result.status !== 'ok') {
      const message = MESSAGES[result.status === 'wrong' ? 'invite' : result.status]
      return [result.status === 'locked' ? 429 : result.status === 'weak' ? 400 : 401, { error: result.status, message }]
    }
    const url = otpauthUrl(result.secret, result.name)
    return [200, { ticket: result.ticket, link: true, setup: { secret: result.secret, qr: await QRCode.toString(url, { type: 'svg', margin: 1 }) } }]
  }

  if (op === 'code' && post) {
    const result = await finishSignIn(req, req.body?.ticket, req.body?.code)
    if (result.status !== 'ok') return [result.status === 'locked' ? 429 : 401, { error: result.status, message: MESSAGES[result.status] }]
    res.setHeader('Set-Cookie', sessionCookie(result.session))
    return [200, { signedIn: true, recoveryCodes: result.recoveryCodes }]
  }

  if (op === 'signout' && post) {
    await signOut(req)
    res.setHeader('Set-Cookie', sessionCookie(null))
    return [200, { signedIn: false }]
  }

  const user = await currentUser(req)
  if (!user) return [401, { error: 'signin' }]

  if (op === 'summary' && req.method === 'GET') {
    if (!can(user.role, 'view')) return [403, { error: 'role' }]
    const [books, stripe] = await Promise.all([loadBooks(), getStripeState()])
    const summary = summarize({ ...books, stripe })
    if (user.role === 'owner') return [200, { role: user.role, summary, recoveryCodesLeft: await recoveryCodesLeft() }]
    return [200, { role: user.role, summary: { ...summary, ownerName: user.name } }]
  }

  const result = (await expenseOps(op, req, user)) ?? (await incomeOps(op, req, user)) ?? (await invoiceOps(op, req, user)) ?? (await booksOps(op, req, user)) ?? (await accessOps(op, req, user))
  if (result) return result

  return [404, { error: 'unknown' }]
}

export default async function finance(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  try {
    const [status, body] = await handle(req, res)
    res.status(status).json(body)
  } catch (err) {
    if (err instanceof Invalid) {
      res.status(400).json({ error: 'invalid', message: err.message })
    } else if (err instanceof StripeProblem) {
      res.status(502).json({ error: 'stripe', message: `Stripe said: ${err.message}` })
    } else if (err instanceof SetupError) {
      res.status(503).json({ error: 'setup', message: err.message })
    } else {
      console.error(err)
      res.status(500).json({ error: 'server', message: 'Something went wrong' })
    }
  }
}
