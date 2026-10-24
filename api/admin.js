// /api/admin: sign-in for Lino's client admin (linocondigital.com/admin).
// Same password and authenticator app as the finance app, owner only.
//   GET  ?op=status    signed in or not
//   POST ?op=password  step 1: the password
//   POST ?op=code      step 2: the 6-digit code (or a recovery code)
//   POST ?op=signout
//   POST ?op=calendar-link { renew? }  the private link to the schedule's calendar feed
//   GET  ?op=calendar&key=<key>        the feed itself (.ics), for Lino's phone calendar
//   GET  ?op=mail-status               whether emails can be sent from the site
//   POST ?op=send-email { id, subject, html, text }  a designed email to that client's saved address
import QRCode from 'qrcode'
import { route } from './_lib/http.js'
import { checkSetup, currentUser, finishSignIn, sessionCookie, signOut, startSignIn } from './_lib/finance/auth.js'
import { otpauthUrl } from './_lib/finance/totp.js'
import { calendarFeed, calendarKey } from './_lib/calendarFeed.js'
import { getClient, isClientId } from './_lib/store.js'
import { isEmail, MailError, mailReady, sendMail } from './_lib/mail.js'

const MESSAGES = {
  wrong: "That didn't match. Try again.",
  locked: 'Too many tries. Sign-in is paused for 15 minutes.',
  expired: 'That took too long. Start again with your password.',
}

const failed = (status) => [status === 'locked' ? 429 : 401, { error: status, message: MESSAGES[status] }]

const handler = route(async (req, res) => {
  const op = req.query?.op
  const post = req.method === 'POST'

  if (op === 'status' && req.method === 'GET') {
    checkSetup()
    const user = await currentUser(req, 'admin')
    return [200, { signedIn: user?.role === 'owner' }]
  }

  if (op === 'password' && post) {
    const result = await startSignIn(req, req.body?.password)
    if (result.status !== 'ok') return failed(result.status)
    // The bookkeeper's password only opens the finance app.
    if (result.role !== 'owner') return failed('wrong')
    const body = { ticket: result.ticket, link: result.enroll }
    if (result.enroll) {
      const url = otpauthUrl(result.secret)
      body.setup = { secret: result.secret, qr: await QRCode.toString(url, { type: 'svg', margin: 1 }) }
    }
    return [200, body]
  }

  if (op === 'code' && post) {
    const result = await finishSignIn(req, req.body?.ticket, req.body?.code, 'admin')
    if (result.status !== 'ok') return failed(result.status)
    res.setHeader('Set-Cookie', sessionCookie(result.session, 'admin'))
    return [200, { signedIn: true, recoveryCodes: result.recoveryCodes }]
  }

  if (op === 'signout' && post) {
    await signOut(req, 'admin')
    res.setHeader('Set-Cookie', sessionCookie(null, 'admin'))
    return [200, { signedIn: false }]
  }

  if (op === 'calendar-link' && post) {
    const user = await currentUser(req, 'admin')
    if (user?.role !== 'owner') return [401, { error: 'signin' }]
    const key = await calendarKey(Boolean(req.body?.renew))
    const host = req.headers['x-forwarded-host'] ?? req.headers.host
    return [200, { url: `https://${host}/api/admin?op=calendar&key=${key}` }]
  }

  if (op === 'mail-status' && req.method === 'GET') {
    const user = await currentUser(req, 'admin')
    if (user?.role !== 'owner') return [401, { error: 'signin' }]
    return [200, { ready: mailReady() }]
  }

  if (op === 'send-email' && post) {
    const user = await currentUser(req, 'admin')
    if (user?.role !== 'owner') return [401, { error: 'signin' }]
    const { id, subject, html, text } = req.body ?? {}
    if (!mailReady()) return [503, { error: 'mail-setup', message: 'Sending from the site is not set up yet.' }]
    if (!isClientId(id)) return [404, { error: 'not-found' }]
    const client = await getClient(id)
    if (!client) return [404, { error: 'not-found' }]
    // Only ever to the address saved for this client.
    const to = client.details?.email?.trim()
    if (!isEmail(to)) return [400, { error: 'no-email', message: 'Add the client\'s email address first.' }]
    const bad = (s, max) => typeof s !== 'string' || !s.trim() || s.length > max
    if (bad(subject, 200) || /[\r\n]/.test(subject) || bad(html, 300000) || bad(text, 50000)) return [400, { error: 'bad-request' }]
    try {
      await sendMail({ to, subject, html, text })
    } catch (err) {
      if (err instanceof MailError) return [502, { error: err.code, message: err.message }]
      console.error(err)
      return [502, { error: 'mail', message: "The email didn't send. Try again in a minute." }]
    }
    return [200, { sent: true, to }]
  }

  return [404, { error: 'unknown' }]
})

export default function admin(req, res) {
  if (req.query?.op === 'calendar' && req.method === 'GET') return calendarFeed(req, res)
  return handler(req, res)
}
