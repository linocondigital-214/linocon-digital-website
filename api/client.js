// /api/client?id=<id>: one client's progress.
// GET is public (the id is the client's private link); changes need the
// admin password.
import { route, isAdmin } from './_lib/http.js'
import { deleteClient, getClient, isClientId, saveClient } from './_lib/store.js'
import { applyChanges, BadRequest } from './_lib/client.js'

export default route(async (req) => {
  const { id } = req.query
  if (!isClientId(id)) return [404, { error: 'not-found' }]

  if (req.method === 'GET') {
    const client = await getClient(id)
    return client ? [200, { client }] : [404, { error: 'not-found' }]
  }

  if (!isAdmin(req)) return [401, { error: 'password' }]

  if (req.method === 'PATCH') {
    const client = await getClient(id)
    if (!client) return [404, { error: 'not-found' }]
    try {
      applyChanges(client, req.body?.changes)
    } catch (err) {
      if (err instanceof BadRequest) return [400, { error: 'bad-request', message: err.message }]
      throw err
    }
    await saveClient(client)
    return [200, { client }]
  }

  if (req.method === 'DELETE') {
    await deleteClient(id)
    return [200, { ok: true }]
  }

  return [405, { error: 'method' }]
})
