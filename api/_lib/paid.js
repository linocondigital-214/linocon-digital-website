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
