// /api/clients: Lino's client list. GET lists every client, POST adds one.
import { route, isAdmin } from './_lib/http.js'
import { listClients, newClientId, saveClient } from './_lib/store.js'
import { newClient } from './_lib/client.js'

export default route(async (req) => {
  if (!isAdmin(req)) return [401, { error: 'password' }]

  if (req.method === 'GET') {
    const clients = await listClients()
    clients.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return [200, { clients }]
  }

  if (req.method === 'POST') {
    const client = newClient(newClientId(), req.body?.details)
    if (!client.details.name) return [400, { error: 'bad-request', message: 'Business name is required' }]
    await saveClient(client)
    return [201, { client }]
  }

  return [405, { error: 'method' }]
})
