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
//   worklog: { <entry id>: { date: 'YYYY-MM-DD', text } }   Lino's private notes, never shown to the client
//   payment: { label, link, portal }   the client's Pay button: Stripe payment link and billing portal
//   schedule: { depositOn: 'YYYY-MM-DD' }  deposit received outside /finance (see api/_lib/schedule.js)
//   fileNo:  'LCF-2026-001'   set once the agreement is signed (api/_lib/fileNo.js)
// }
import { isDrawing } from './esign.js'

// What the client's own page may see: proposal and agreement drafts stay
// private until Lino marks them as sent, and the work log is Lino's only.
export function publicView(client) {
  const docs = Object.fromEntries(
    Object.entries(client.docs ?? {}).filter(([, d]) => d?.status === 'sent' || d?.status === 'signed'),
  )
  const view = { ...client, docs }
  delete view.worklog
  return view
}

const DETAIL_FIELDS = ['name', 'website', 'contact', 'email', 'serviceArea', 'startDate']
const SERVICES = ['website', 'seo', 'backlinks', 'grow']
const EDITABLE = new Set(['details', 'has', 'done', 'na', 'signoff', 'numbers', 'months', 'docs', 'worklog', 'payment', 'schedule'])
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
    // Lino's drawn countersignature is the one longer text allowed.
    const isOwnerDrawing = path.length === 3 && path[0] === 'docs' && path[2] === 'ownerDrawing'
    const ok =
      value === null ||
      typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && (isOwnerDrawing ? isDrawing(value) : value.length <= 4000))
    if (!ok) throw new BadRequest('Invalid change value')
    if (path[0] === 'payment') checkPayment(path, value)
    if (path[0] === 'schedule' && !(path.length === 2 && path[1] === 'depositOn' && (value === null || /^\d{4}-\d{2}-\d{2}$/.test(value)))) {
      throw new BadRequest('Invalid change path')
    }
    // A client's e-signature is only written by the client signing
    // (api/_lib/esign.js). Lino can clear it, never write it.
    if (path[0] === 'docs' && path[2] === 'esign' && !(path.length === 3 && value === null)) {
      throw new BadRequest('Invalid change path')
    }

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

// The Pay button may only point at Stripe's own pages.
const PAYMENT_FIELDS = new Set(['label', 'link', 'portal'])

function checkPayment(path, value) {
  if (path.length !== 2 || !PAYMENT_FIELDS.has(path[1])) throw new BadRequest('Invalid change path')
  if (value === null) return
  if (typeof value !== 'string') throw new BadRequest('Invalid change value')
  if (path[1] !== 'label' && !isStripeLink(value)) throw new BadRequest('Payment links must be https Stripe links')
}

function isStripeLink(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'stripe.com' || url.hostname.endsWith('.stripe.com'))
  } catch {
    return false
  }
}

export class BadRequest extends Error {}
