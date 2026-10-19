// The books, saved in the same Upstash Redis as the client pages, under
// "fin:" keys. Amounts are whole cents so totals never drift.
//
// income:   { id, date: 'YYYY-MM-DD', amount (before GST), gst, service, clientId, client, source: 'stripe' | 'manual', fee }
// expense:  { id, date, vendor, category, amount (total paid), gst (GST/HST part), receipt: bool, note }
// invoice:  { id, number, clientId, client, issued, due, subtotal, gst, status: 'draft' | 'open' | 'paid' | 'void', paidOn }
// settings: { ownerName, gstRegistered, gstRegisteredOn, gstFiling: 'Annual' | 'Quarterly', openingCash, openingDate }
import { redis } from '../store.js'

export const KINDS = ['income', 'expense', 'invoice']

export const DEFAULT_SETTINGS = {
  ownerName: 'Lino',
  gstRegistered: false,
  gstRegisteredOn: null,
  gstFiling: 'Annual',
  openingCash: 0,
  openingDate: null,
}

export async function listRecords(kind) {
  const ids = await redis(['SMEMBERS', `fin:${kind}`])
  const records = await Promise.all(ids.map((id) => redis(['GET', `fin:${kind}:${id}`])))
  return records.filter(Boolean).map((r) => JSON.parse(r))
}

export async function getSettings() {
  const raw = await redis(['GET', 'fin:settings'])
  return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) }
}
