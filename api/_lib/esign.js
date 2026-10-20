// Electronic signatures: the signed-in client types their name and ticks "I
// agree" on a document Lino has sent (POST /api/portal?op=sign). We record who,
// when, from where, and a fingerprint of exactly what they saw, so the record
// shows if the document was changed afterwards.
import { createHash } from 'node:crypto'

export const SIGNABLE = new Set(['package', 'proposal', 'agreement'])

// What the document's wording depends on: the client's details, the fields and
// reworded sections of both documents (the agreement uses the proposal's
// prices), and for the package its own choices.
export function docFingerprint(client, doc) {
  const docs = client.docs ?? {}
  const SKIP = new Set(['status', 'sentAt', 'signedAt', 'esign', 'ownerName', 'ownerAt', 'ownerDrawing'])
  const strip = (d = {}) => Object.fromEntries(Object.entries(d).filter(([k]) => !SKIP.has(k)))
  const content =
    doc === 'package'
      ? { details: client.details, package: strip(docs.package) }
      : { details: client.details, proposal: strip(docs.proposal), agreement: strip(docs.agreement), doc }
  return createHash('sha256').update(stableJson(content)).digest('hex').slice(0, 16)
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson(value[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(value ?? null)
}

// A drawn signature is an SVG path of moves and lines on a 600 x 200 box.
export const MAX_DRAWING = 20000
export const isDrawing = (d) => typeof d === 'string' && d.length > 0 && d.length <= MAX_DRAWING && /^[ML0-9 .-]+$/.test(d)

const vancouverDate = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(date)

// Returns 'ok' or why it can't be signed.
export function signDoc(client, doc, { name, agree, drawing, ip, agent }) {
  if (!SIGNABLE.has(doc)) return 'unknown'
  const state = client.docs?.[doc]
  if (!state || state.status !== 'sent') return state?.status === 'signed' ? 'signed' : 'not-sent'
  const cleanName = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : ''
  if (cleanName.length < 2 || cleanName.length > 100) return 'name'
  if (agree !== true) return 'agree'
  if (drawing != null && drawing !== '' && !isDrawing(drawing)) return 'drawing'

  const now = new Date()
  state.status = 'signed'
  state.signedAt = vancouverDate(now)
  state.esign = {
    name: cleanName,
    at: now.toISOString(),
    ip: String(ip ?? '').slice(0, 64),
    agent: String(agent ?? '').slice(0, 200),
    fingerprint: docFingerprint(client, doc),
  }
  if (drawing) state.esign.drawing = drawing
  client.updatedAt = now.toISOString()
  return 'ok'
}

// For Lino's admin: which signed documents have changed since the client
// signed them. Added to the response only, never saved.
export function withSignChecks(client) {
  const changed = Object.entries(client.docs ?? {})
    .filter(([doc, d]) => d?.esign && d.status === 'signed' && d.esign.fingerprint !== docFingerprint(client, doc))
    .map(([doc]) => doc)
  return { ...client, signChanged: changed }
}
