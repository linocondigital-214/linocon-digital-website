// /api/client?id=<id>: one client's progress, for Lino's admin only. Clients
// read their own progress through /api/portal once signed in.
import { route, isAdmin } from './_lib/http.js'
import { deleteClient, getClient, isClientId, saveClient } from './_lib/store.js'
import { applyChanges, BadRequest } from './_lib/client.js'
import { removeLogin } from './_lib/portal.js'
import { withSignChecks } from './_lib/esign.js'
import { ensureFileNo } from './_lib/fileNo.js'
import { firstPaidByClient } from './_lib/paid.js'

// What Lino's pages get: the client, which signed documents changed, and the
// date of their first paid invoice (it starts the schedule of work).
const forAdmin = async (client) => ({ ...withSignChecks(client), paidOn: (await firstPaidByClient())[client.id] ?? null })

export default route(async (req) => {
  if (!(await isAdmin(req))) return [401, { error: 'signin' }]
  const { id } = req.query
  if (!isClientId(id)) return [404, { error: 'not-found' }]

  if (req.method === 'GET') {
    const client = await getClient(id)
    if (!client) return [404, { error: 'not-found' }]
    // Agreements signed before file numbers existed get theirs here.
    if (await ensureFileNo(client)) await saveClient(client)
    return [200, { client: await forAdmin(client) }]
  }

  if (req.method === 'PATCH') {
    const client = await getClient(id)
    if (!client) return [404, { error: 'not-found' }]
    try {
      applyChanges(client, req.body?.changes)
    } catch (err) {
      if (err instanceof BadRequest) return [400, { error: 'bad-request', message: err.message }]
      throw err
    }
    await ensureFileNo(client)
    await saveClient(client)
    return [200, { client: await forAdmin(client) }]
  }

  if (req.method === 'DELETE') {
    await removeLogin(id)
    await deleteClient(id)
    return [200, { ok: true }]
  }

  return [405, { error: 'method' }]
})
