// The Access page calls behind /api/finance (owner only):
//   GET  ?op=access          the bookkeeper and any unused invite
//   POST ?op=access-invite   { name }  a new one-time invite code, shown once
//   POST ?op=access-remove   removes the bookkeeper and signs them out
import { can } from './roles.js'
import { Invalid } from './expenses.js'
import { accessStatus, inviteBookkeeper, removeBookkeeper } from './auth.js'

const denied = [403, { error: 'role', message: 'Only the owner can change who has access.' }]

export async function accessOps(op, req, user) {
  const post = req.method === 'POST'

  if (op === 'access' && req.method === 'GET') {
    if (!can(user.role, 'access')) return denied
    return [200, await accessStatus()]
  }

  if (op === 'access-invite' && post) {
    if (!can(user.role, 'access')) return denied
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 40) : ''
    if (!name) throw new Invalid('Type your bookkeeper’s name.')
    if ((await accessStatus()).bookkeeper) throw new Invalid('Remove your current bookkeeper first.')
    return [200, { ...(await inviteBookkeeper(name)), name }]
  }

  if (op === 'access-remove' && post) {
    if (!can(user.role, 'access')) return denied
    await removeBookkeeper()
    return [200, await accessStatus()]
  }

  return null
}
