// When each client first paid an invoice in /finance: their deposit, for the
// schedule of work (api/_lib/schedule.js).
import { listRecords } from './finance/records.js'

export async function firstPaidByClient() {
  const paid = {}
  for (const inv of await listRecords('invoice')) {
    if (inv.status !== 'paid' || !inv.clientId || !inv.paidOn) continue
    if (!paid[inv.clientId] || inv.paidOn < paid[inv.clientId]) paid[inv.clientId] = inv.paidOn
  }
  return paid
}

// One client's invoices, for the client journey (src/lib/journey.js) in
// /admin and on the client's own page: whether one was sent, when the first
// was paid, and the sent ones still waiting to be paid, with their Pay now link.
export async function billingFor(clientId) {
  const mine = (await listRecords('invoice')).filter((inv) => inv.clientId === clientId && ['open', 'paid'].includes(inv.status))
  const paidOn = mine
    .filter((inv) => inv.status === 'paid' && inv.paidOn)
    .map((inv) => inv.paidOn)
    .sort()[0]
  const unpaid = mine
    .filter((inv) => inv.status === 'open')
    .sort((a, b) => (a.due || '').localeCompare(b.due || ''))
    .map((inv) => ({ number: inv.number, total: inv.subtotal + (inv.gst || 0), due: inv.due || null, payUrl: inv.payUrl || null }))
  return { invoiced: mine.length > 0, paidOn: paidOn ?? null, unpaid }
}
