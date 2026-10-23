// A client's file number (LCF-2026-001), given once their service agreement is
// signed. Lino types it into a new invoice in /finance to fill it in from the
// client's package. Saved as client.fileNo, outside the documents, so it
// doesn't change what the client signed.
import { redis } from './store.js'

export const cleanFileNo = (value) => String(value ?? '').toUpperCase().replace(/\s+/g, '').slice(0, 20)

const vancouverYear = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver', year: 'numeric' }).format(new Date())

// Adds the number if the agreement is signed and there isn't one yet.
// Returns true when it added one, so the caller saves the client.
export async function ensureFileNo(client) {
  if (client.fileNo || client.docs?.agreement?.status !== 'signed') return false
  const year = vancouverYear()
  const n = await redis(['INCR', `client:file:counter:${year}`])
  client.fileNo = `LCF-${year}-${String(n).padStart(3, '0')}`
  return true
}
