// The income calls behind /api/finance:
//   GET  ?op=income         every payment (newest first), Stripe status, clients and services
//   POST ?op=stripe-sync    { force? }  read anything new from Stripe
//   POST ?op=income-add     { income }  a payment that didn't go through Stripe
//   POST ?op=income-edit    { id, income }  (owner only) Stripe payments: service, client and note only
//   POST ?op=income-delete  { id }      (owner only) manual payments only
import { listClients } from '../store.js'
import { can } from './roles.js'
import { RECEIVED_BY, SERVICES, cleanIncome, cleanLabels } from './income.js'
import { deleteRecord, getRecord, getSettings, isRecordId, listRecords, newRecordId, saveRecord } from './records.js'
import { getStripeState, syncStripe } from './stripe.js'
import { notifyClients } from '../progressMail.js'

const denied = [403, { error: 'role', message: 'Your login can’t do that.' }]
const byDate = (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)

export async function incomeOps(op, req, user) {
  const get = req.method === 'GET'
  const post = req.method === 'POST'

  if (op === 'income' && get) {
    if (!can(user.role, 'view')) return denied
    const [income, clients, stripe, settings] = await Promise.all([listRecords('income'), listClients(), getStripeState(), getSettings()])
    return [
      200,
      {
        income: income.sort(byDate),
        clients: clients.map((c) => ({ id: c.id, name: c.details.name })).sort((a, b) => a.name.localeCompare(b.name)),
        services: SERVICES,
        receivedBy: RECEIVED_BY,
        stripe,
        gstRegistered: settings.gstRegistered,
        canEdit: can(user.role, 'edit'),
        canDelete: can(user.role, 'delete'),
      },
    ]
  }

  if (op === 'stripe-sync' && post) {
    if (!can(user.role, 'add')) return denied
    const stripe = await syncStripe({ force: Boolean(req.body?.force) })
    // Invoices paid through Stripe since the last sync send their progress emails.
    await notifyClients((await listRecords('invoice')).filter((i) => i.status === 'paid').map((i) => i.clientId))
    return [200, { stripe }]
  }

  if (op === 'income-add' && post) {
    if (!can(user.role, 'add')) return denied
    const fields = cleanIncome(req.body?.income, await listClients())
    const now = new Date().toISOString()
    const income = { id: newRecordId(), ...fields, source: 'manual', createdAt: now, updatedAt: now }
    await saveRecord('income', income)
    return [201, { income }]
  }

  if (op === 'income-edit' && post) {
    if (!can(user.role, 'edit')) return denied
    const id = req.body?.id
    const existing = isRecordId(id) ? await getRecord('income', id) : null
    if (!existing) return [404, { error: 'missing', message: 'That payment was already removed.' }]
    const clients = await listClients()
    // Stripe's amounts and dates stay as Stripe recorded them.
    const fields = existing.source === 'stripe' ? cleanLabels(req.body?.income, clients) : cleanIncome(req.body?.income, clients)
    const income = { ...existing, ...fields, updatedAt: new Date().toISOString() }
    await saveRecord('income', income)
    return [200, { income }]
  }

  if (op === 'income-delete' && post) {
    if (!can(user.role, 'delete')) return denied
    const id = req.body?.id
    const existing = isRecordId(id) ? await getRecord('income', id) : null
    if (!existing) return [404, { error: 'missing' }]
    if (existing.source === 'stripe') return [400, { error: 'invalid', message: 'Payments from Stripe stay in the books. Refunds show up on their own.' }]
    await deleteRecord('income', id)
    return [200, { deleted: id }]
  }

  return null
}
