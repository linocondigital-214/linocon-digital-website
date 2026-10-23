// /api/clients: Lino's client list (admin only). GET lists every client, POST adds one.
import { route, isAdmin } from './_lib/http.js'
import { listClients, newClientId, saveClient } from './_lib/store.js'
import { newClient } from './_lib/client.js'
import { loginStatus } from './_lib/portal.js'
import { firstPaidByClient } from './_lib/paid.js'

export default route(async (req) => {
  if (!(await isAdmin(req))) return [401, { error: 'signin' }]

  if (req.method === 'GET') {
    const clients = await listClients()
    clients.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    // Whether each client has set up their login, for the overview.
    const logins = Object.fromEntries(await Promise.all(clients.map(async (c) => [c.id, await loginStatus(c.id)])))
    // The first paid invoice per client, which starts their schedule of work.
    return [200, { clients, logins, paidOn: await firstPaidByClient() }]
  }

  if (req.method === 'POST') {
    const client = newClient(newClientId(), req.body?.details)
    if (!client.details.name) return [400, { error: 'bad-request', message: 'Business name is required' }]
    await saveClient(client)
    return [201, { client }]
  }

  return [405, { error: 'method' }]
})
