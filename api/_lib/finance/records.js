// The books, saved in the same Upstash Redis as the client pages, under
// "fin:" keys. Amounts are whole cents so totals never drift.
//
// income:   { id, date: 'YYYY-MM-DD', amount (before GST), gst, service, clientId, client, source: 'stripe' | 'manual', fee }
// expense:  { id, date, vendor, category, amount (total paid), gst (GST/HST part), paidWith, receipt: bool, note, createdAt, updatedAt }
//           receipt photos are kept apart under fin:receipt:<id> so lists stay small
// invoice:  { id, number, clientId, client, issued, due, subtotal, gst, status: 'draft' | 'open' | 'paid' | 'void', paidOn }
// settings: { ownerName, gstRegistered, gstRegisteredOn, gstFiling: 'Annual' | 'Quarterly', openingCash, openingDate }
import { randomBytes } from 'node:crypto'
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

export const newRecordId = () => randomBytes(9).toString('base64url')
export const isRecordId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{12}$/.test(id)

export async function getRecord(kind, id) {
  const raw = await redis(['GET', `fin:${kind}:${id}`])
  return raw ? JSON.parse(raw) : null
}

export async function saveRecord(kind, record) {
  await redis(['SET', `fin:${kind}:${record.id}`, JSON.stringify(record)])
  await redis(['SADD', `fin:${kind}`, record.id])
}

export async function deleteRecord(kind, id) {
  await redis(['DEL', `fin:${kind}:${id}`])
  await redis(['SREM', `fin:${kind}`, id])
}

// Receipt photos: a JPEG data URL, shrunk on the phone before upload.
export const getReceipt = (id) => redis(['GET', `fin:receipt:${id}`])
export const saveReceipt = (id, dataUrl) => redis(['SET', `fin:receipt:${id}`, dataUrl])
export const deleteReceipt = (id) => redis(['DEL', `fin:receipt:${id}`])

// What Lino picked for each vendor, so the next expense from them is
// sorted the same way.
export async function getLearned() {
  const raw = await redis(['GET', 'fin:vendorcats'])
  return raw ? JSON.parse(raw) : {}
}

export async function saveLearned(map) {
  await redis(['SET', 'fin:vendorcats', JSON.stringify(map)])
}
