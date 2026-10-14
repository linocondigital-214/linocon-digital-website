// Shape of a saved client:
// {
//   id, createdAt, updatedAt,
//   details: { name, website, contact, email, serviceArea, startDate, services: { website, seo, backlinks, grow } },
//   has:     { <intake id>: 'yes' | 'no' | 'unsure', '<intake id>.note': text }   what the client already has
//   done:    { <item id>: 'YYYY-MM-DD' }   ticked stage items and Grow setup
//   na:      { <item id>: true }           items that don't apply to this client
//   signoff: { audit | plan | build: 'YYYY-MM-DD' }
//   numbers: { baseline: { <metric>: value }, now: { <metric>: value } }
//   months:  { 'YYYY-MM': { done: { <item id>: true }, log: { saw, why, improved, next } } }
//   docs:    { proposal | agreement: { status: 'draft' | 'sent' | 'signed', sentAt, signedAt,
//              fields: { <field>: text }, text: { <section id>: text } } }
// }

// What the client's own page may see: proposal and agreement drafts stay
// private until Lino marks them as sent.
export function publicView(client) {
  const docs = Object.fromEntries(
    Object.entries(client.docs ?? {}).filter(([, d]) => d?.status === 'sent' || d?.status === 'signed'),
  )
  return { ...client, docs }
}

const DETAIL_FIELDS = ['name', 'website', 'contact', 'email', 'serviceArea', 'startDate']
const SERVICES = ['website', 'seo', 'backlinks', 'grow']
const EDITABLE = new Set(['details', 'has', 'done', 'na', 'signoff', 'numbers', 'months', 'docs'])
const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype'])
const MAX_SIZE = 200_000

const text = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function newClient(id, input = {}) {
  const details = Object.fromEntries(DETAIL_FIELDS.map((f) => [f, text(input[f])]))
  details.services = Object.fromEntries(SERVICES.map((s) => [s, Boolean(input.services?.[s])]))
  const now = new Date().toISOString()
  return { id, createdAt: now, updatedAt: now, details, has: {}, done: {}, na: {}, signoff: {}, numbers: {}, months: {} }
}

// A change is { path: ['done', '<item id>'], value }. A null value removes the
// entry. Small changes (one tick at a time) mean a laptop and a phone open at
// the same time don't overwrite each other's ticks.
export function applyChanges(client, changes) {
  if (!Array.isArray(changes) || changes.length === 0 || changes.length > 50) {
    throw new BadRequest('Expected a list of changes')
  }
  for (const { path, value } of changes) {
    if (
      !Array.isArray(path) ||
      path.length < 2 ||
      path.length > 4 ||
      !EDITABLE.has(path[0]) ||
      !path.every((p) => typeof p === 'string' && /^[\w.-]{1,80}$/.test(p) && !FORBIDDEN.has(p))
    ) {
      throw new BadRequest('Invalid change path')
    }
    const ok =
      value === null ||
      typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && value.length <= 4000)
    if (!ok) throw new BadRequest('Invalid change value')

    let node = client
    for (const key of path.slice(0, -1)) {
      if (typeof node[key] !== 'object' || node[key] === null || Array.isArray(node[key])) node[key] = {}
      node = node[key]
    }
    const last = path[path.length - 1]
    if (value === null) delete node[last]
    else node[last] = value
  }
  client.updatedAt = new Date().toISOString()
  if (JSON.stringify(client).length > MAX_SIZE) throw new BadRequest('Client record is too large')
  return client
}

export class BadRequest extends Error {}
