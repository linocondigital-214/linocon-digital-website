// /api/portal: client logins (linocondigital.com/clients). See _lib/portal.js.
// For the client:
//   GET  ?op=status    signed in or not
//   POST ?op=signin    { email, password }
//   POST ?op=invite    { code, email, password }  first sign-in with Lino's invite code
//   POST ?op=signout
//   GET  ?op=me        their own progress (drafts and Lino's notes left out)
//   POST ?op=sign      { doc, name, agree, drawing? }  e-sign a document Lino has sent
//   POST ?op=wishes    { hasSite, site, picks, when, note }  what they want (step 2)
//   POST ?op=changes   { doc, note }  ask for changes to the package or proposal
//   POST ?op=has       { answers: [{ id, value?, note? }], done? }  what they already have
// For Lino (signed in to /admin):
//   GET  ?op=login&id=<client id>   the client's login and any unused invite
//   POST ?op=login-invite { id }    a new one-time invite code, shown once
//   POST ?op=login-remove { id }    removes the login and signs the client out
import { route, isAdmin } from './_lib/http.js'
import { getClient, isClientId, saveClient } from './_lib/store.js'
import { signDoc } from './_lib/esign.js'
import { ensureFileNo } from './_lib/fileNo.js'
import { publicView } from './_lib/client.js'
import { billingFor } from './_lib/paid.js'
import { askChanges, saveHas, saveWishes } from './_lib/clientInput.js'
import { MIN_PASSWORD, acceptInvite, currentClient, inviteClient, loginStatus, removeLogin, sessionCookie, signIn, signOut } from './_lib/portal.js'

const MESSAGES = {
  wrong: "That email and password didn't match. Try again.",
  locked: 'Too many tries. Sign-in is paused for 15 minutes.',
  invite: "That invite code didn't work. Check it, or ask LinoCon Digital for a new one.",
  email: 'Type a valid email address.',
  weak: `Choose a password of at least ${MIN_PASSWORD} characters.`,
  taken: 'That email is already used for another login. Use a different email.',
}

const SIGN_MESSAGES = {
  unknown: 'This document can’t be signed.',
  'not-sent': 'This document isn’t ready to sign yet.',
  signed: 'This document is already signed.',
  name: 'Type your full name to sign.',
  agree: 'Tick the box to agree before signing.',
  drawing: 'That drawing could not be saved. Clear it and try again.',
}

const INPUT_MESSAGES = {
  wishes: 'Answer whether you have a website, and pick at least one thing you want.',
  unknown: 'This document can’t be changed.',
  'not-sent': 'This document isn’t waiting for your answer.',
  note: 'Type what you would like changed.',
  has: 'That answer could not be saved. Refresh the page and try again.',
}

// The client's own page also shows their unpaid invoices, to pay from their steps.
const clientView = async (client) => ({ ...publicView(client), billing: await billingFor(client.id) })

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
    return [200, { client: await clientView(client) }]
  }

  if (op === 'sign' && post) {
    const clientId = await currentClient(req)
    if (!clientId) return [401, { error: 'signin' }]
    const client = await getClient(clientId)
    if (!client) return [404, { error: 'not-found' }]
    const result = signDoc(client, req.body?.doc, {
      name: req.body?.name,
      agree: req.body?.agree,
      drawing: req.body?.drawing,
      ip: String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress,
      agent: req.headers['user-agent'],
    })
    if (result !== 'ok') return [result === 'signed' ? 409 : 400, { error: result, message: SIGN_MESSAGES[result] }]
    await ensureFileNo(client)
    await saveClient(client)
    return [200, { client: await clientView(client) }]
  }

  if ((op === 'wishes' || op === 'changes' || op === 'has') && post) {
    const clientId = await currentClient(req)
    if (!clientId) return [401, { error: 'signin' }]
    const client = await getClient(clientId)
    if (!client) return [404, { error: 'not-found' }]
    const body = req.body ?? {}
    const result =
      op === 'wishes' ? saveWishes(client, body) : op === 'changes' ? askChanges(client, body.doc, body.note) : saveHas(client, body.answers, body.done)
    if (result !== 'ok') return [400, { error: result, message: INPUT_MESSAGES[result] }]
    client.updatedAt = new Date().toISOString()
    await saveClient(client)
    return [200, { client: await clientView(client) }]
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
