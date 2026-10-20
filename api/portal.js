// /api/portal: client logins (linocondigital.com/clients). See _lib/portal.js.
// For the client:
//   GET  ?op=status    signed in or not
//   POST ?op=signin    { email, password }
//   POST ?op=invite    { code, email, password }  first sign-in with Lino's invite code
//   POST ?op=signout
//   GET  ?op=me        their own progress (drafts and Lino's notes left out)
// For Lino (signed in to /admin):
//   GET  ?op=login&id=<client id>   the client's login and any unused invite
//   POST ?op=login-invite { id }    a new one-time invite code, shown once
//   POST ?op=login-remove { id }    removes the login and signs the client out
import { route, isAdmin } from './_lib/http.js'
import { getClient, isClientId } from './_lib/store.js'
import { publicView } from './_lib/client.js'
import { MIN_PASSWORD, acceptInvite, currentClient, inviteClient, loginStatus, removeLogin, sessionCookie, signIn, signOut } from './_lib/portal.js'

const MESSAGES = {
  wrong: "That email and password didn't match. Try again.",
  locked: 'Too many tries. Sign-in is paused for 15 minutes.',
  invite: "That invite code didn't work. Check it, or ask LinoCon Digital for a new one.",
  email: 'Type a valid email address.',
  weak: `Choose a password of at least ${MIN_PASSWORD} characters.`,
  taken: 'That email is already used for another login. Use a different email.',
}

const failed = (status) => [status === 'locked' ? 429 : ['email', 'weak', 'taken'].includes(status) ? 400 : 401, { error: status, message: MESSAGES[status] }]

export default route(async (req, res) => {
  const op = req.query?.op
  const post = req.method === 'POST'

  if (op === 'status' && req.method === 'GET') return [200, { signedIn: Boolean(await currentClient(req)) }]

  if ((op === 'signin' || op === 'invite') && post) {
    const { code, email, password } = req.body ?? {}
    const result = op === 'signin' ? await signIn(req, email, password) : await acceptInvite(req, code, email, password)
    if (result.status !== 'ok') return failed(result.status)
    res.setHeader('Set-Cookie', sessionCookie(result.session))
    return [200, { signedIn: true }]
  }

  if (op === 'signout' && post) {
    await signOut(req)
    res.setHeader('Set-Cookie', sessionCookie(null))
    return [200, { signedIn: false }]
  }

  if (op === 'me' && req.method === 'GET') {
    const clientId = await currentClient(req)
    if (!clientId) return [401, { error: 'signin' }]
    const client = await getClient(clientId)
    if (!client) return [404, { error: 'not-found' }]
    return [200, { client: publicView(client) }]
  }

  if (op?.startsWith('login')) {
    if (!(await isAdmin(req))) return [401, { error: 'signin' }]
    const id = post ? req.body?.id : req.query.id
    if (!isClientId(id) || !(await getClient(id))) return [404, { error: 'not-found' }]
    if (op === 'login' && req.method === 'GET') return [200, await loginStatus(id)]
    if (op === 'login-invite' && post) return [200, { ...(await inviteClient(id)), ...(await loginStatus(id)) }]
    if (op === 'login-remove' && post) {
      await removeLogin(id)
      return [200, await loginStatus(id)]
    }
  }

  return [404, { error: 'unknown' }]
})
