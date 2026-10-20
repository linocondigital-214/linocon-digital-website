// Brings Stripe payments into the books. Lino adds a restricted Stripe key
// as STRIPE_FINANCE_KEY in Vercel; the app reads with it and never shows it.
//
// A sync reads Stripe's balance history (the same list Stripe pays out
// from), so every payment, refund and fee is counted once:
//   payment  -> an income record, matched to a client from /clients
//   refund   -> a negative income record with the same client and service
//   fees     -> one "Stripe" expense per month under Bank & payment fees
// It also works out monthly recurring revenue (MRR) from active subscriptions,
// and marks invoices sent from the app as paid once Stripe says so.
import { createHash } from 'node:crypto'
import { listClients, redis } from '../store.js'
import { getRecord, isRecordId, listRecords, saveRecord } from './records.js'
import { today } from './summary.js'

const STATE_KEY = 'fin:stripe:state'
const OTHER_FEES_KEY = 'fin:stripe:otherfees'
const API_VERSION = '2024-06-20'
const FRESH_FOR = 2 * 60_000

export class StripeProblem extends Error {}

export function stripeKey() {
  const key = process.env.STRIPE_FINANCE_KEY?.trim()
  return key && /^(rk|sk)_(live|test)_/.test(key) ? key : null
}

// Local previews can point at a stand-in Stripe; the live site always talks to Stripe.
const apiBase = () => (process.env.LCD_MEMORY_STORE && process.env.STRIPE_API_BASE) || 'https://api.stripe.com'

// Params use Stripe's own form names, like 'custom_fields[0][name]'.
async function stripeRequest(method, path, params = {}) {
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    for (const item of [v].flat()) query.append(k, String(item))
  }
  const headers = { Authorization: `Bearer ${stripeKey()}`, 'Stripe-Version': API_VERSION }
  const get = method === 'GET'
  if (method === 'POST') headers['Content-Type'] = 'application/x-www-form-urlencoded'
  const options = { method, headers }
  if (method === 'POST') options.body = query
  const res = await fetch(`${apiBase()}/v1/${path}${get ? `?${query}` : ''}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.error?.message ?? `Stripe answered ${res.status}`
    throw new StripeProblem(res.status === 401 ? 'Stripe didn’t accept the key. It may have been deleted or mistyped.' : message)
  }
  return data
}

export const stripeGet = (path, params) => stripeRequest('GET', path, params)
export const stripePost = (path, params) => stripeRequest('POST', path, params)
export const stripeDelete = (path) => stripeRequest('DELETE', path)

async function savedState() {
  const raw = await redis(['GET', STATE_KEY])
  return raw ? JSON.parse(raw) : {}
}

export async function getStripeState() {
  return { connected: Boolean(stripeKey()), ...(await savedState()) }
}

// Income and fee ids come from Stripe's own ids, so a payment is never added twice.
export const stripeRecordId = (stripeId) => createHash('sha256').update(stripeId).digest('base64url').slice(0, 12)

export const dateOf = (unix) => today(new Date(unix * 1000))

// Which LinoCon service a payment was for, from the product names and
// descriptions Stripe has. Order matters: bundles before their parts.
const SERVICES = [
  ['Grow Bundle', /grow bundle/],
  ['Launch Bundle', /launch bundle/],
  ['LinoCon Complete', /linocon complete/],
  ['Grow Plan', /grow plan|website care/],
  ['Backlink Building', /backlink/],
  ['SEO Setup', /seo setup/],
  ['Website Creation', /website creation|website deposit|final payment|new website/],
  ['Extra Work', /extra work|per hour/],
]

export function guessService(texts) {
  const all = texts.filter(Boolean).join(' ').toLowerCase()
  return SERVICES.find(([, pattern]) => pattern.test(all))?.[0] ?? null
}

// Finds the /clients client by email first, then by business or contact name.
export function matchClient(clients, { emails, names }) {
  const wanted = emails.filter(Boolean).map((e) => e.toLowerCase())
  const byEmail = clients.find((c) => c.details?.email && wanted.includes(c.details.email.toLowerCase()))
  if (byEmail) return byEmail
  const wantedNames = names.filter(Boolean).map((n) => n.trim().toLowerCase())
  return clients.find((c) => [c.details?.name, c.details?.contact].some((n) => n && wantedNames.includes(n.trim().toLowerCase()))) ?? null
}

// Looks up who paid and what for. Only runs for payments not seen before.
async function describePayment(charge) {
  const customer = typeof charge.customer === 'string' ? await stripeGet(`customers/${charge.customer}`).catch(() => ({})) : {}
  const invoice = typeof charge.invoice === 'string' ? await stripeGet(`invoices/${charge.invoice}`).catch(() => null) : null
  const texts = [charge.description, ...(invoice?.lines?.data ?? []).map((l) => l.description ?? l.price?.nickname)]
  let tax = invoice?.tax ?? 0
  // Payment links don't put the product on the charge; the checkout session has it.
  if (!guessService(texts) && charge.payment_intent && !invoice) {
    const sessions = await stripeGet('checkout/sessions', { payment_intent: charge.payment_intent, 'expand[]': 'data.line_items' }).catch(() => null)
    const session = sessions?.data?.[0]
    if (session) {
      texts.push(...(session.line_items?.data ?? []).map((l) => l.description))
      tax = session.total_details?.amount_tax ?? tax
    }
  }
  return {
    texts,
    tax,
    emails: [customer.email, charge.billing_details?.email, charge.receipt_email],
    names: [customer.name, charge.billing_details?.name],
    invoiceId: invoice?.metadata?.lcd_invoice ?? null,
    label: customer.name || charge.billing_details?.name || customer.email || charge.billing_details?.email || 'Stripe customer',
  }
}

// Reads anything new in Stripe and saves it. Quick to call: it skips the
// trip to Stripe if it ran in the last two minutes, unless forced.
export async function syncStripe({ force = false } = {}) {
  if (!stripeKey()) return getStripeState()
  const state = await savedState()
  if (!force && state.lastSync && Date.now() - state.lastSync < FRESH_FOR) return { connected: true, ...state }
  if (!(await redis(['SET', 'fin:stripe:lock', '1', 'NX', 'EX', '60']))) return { connected: true, ...state }

  try {
    const clients = await listClients()
    const otherFees = JSON.parse((await redis(['GET', OTHER_FEES_KEY])) ?? '{}')
    const txns = []
    let after = null
    for (let page = 0; page < 20; page++) {
      const params = { limit: 100, 'expand[]': 'data.source' }
      if (state.cursor) params['created[gte]'] = state.cursor
      if (after) params.starting_after = after
      const list = await stripeGet('balance_transactions', params)
      txns.push(...list.data)
      if (!list.has_more || !list.data.length) break
      after = list.data.at(-1).id
    }
    // Stripe lists newest first; oldest first means a payment is saved before its refund.
    txns.sort((x, y) => x.created - y.created)
    let newest = state.cursor ?? 0
    let added = 0
    for (const txn of txns) {
      newest = Math.max(newest, txn.created)
      added += await saveTransaction(txn, clients, otherFees)
    }
    await redis(['SET', OTHER_FEES_KEY, JSON.stringify(otherFees)])
    await saveMonthlyFees(otherFees)
    await refreshInvoices()
    const mrr = await monthlyRecurring()
    const next = { lastSync: Date.now(), cursor: newest, mrr: mrr.amount, subscriptions: mrr.count, added, error: null }
    await redis(['SET', STATE_KEY, JSON.stringify(next)])
    return { connected: true, ...next }
  } catch (err) {
    const next = { ...state, error: err instanceof StripeProblem ? err.message : 'Stripe couldn’t be reached. It will try again.' }
    await redis(['SET', STATE_KEY, JSON.stringify(next)])
    if (!(err instanceof StripeProblem)) console.error(err)
    return { connected: true, ...next }
  } finally {
    await redis(['DEL', 'fin:stripe:lock'])
  }
}

// Saves one balance transaction. Returns 1 when it added a record.
async function saveTransaction(txn, clients, otherFees) {
  const id = stripeRecordId(txn.id)
  if (txn.type === 'stripe_fee' || txn.type === 'tax_fee') {
    otherFees[txn.id] = { date: dateOf(txn.created), amount: -txn.amount + txn.fee }
    return 0
  }
  const isPayment = txn.type === 'charge' || txn.type === 'payment'
  const isRefund = txn.type === 'refund' || txn.type === 'payment_refund'
  if (!isPayment && !isRefund) return 0
  if (await getRecord('income', id)) return 0

  const now = new Date().toISOString()
  const base = { id, date: dateOf(txn.created), fee: txn.fee, source: 'stripe', stripeId: txn.id, createdAt: now, updatedAt: now }
  let record
  if (isPayment) {
    const charge = typeof txn.source === 'object' && txn.source ? txn.source : {}
    const info = await describePayment(charge)
    // A payment for an invoice sent from the app takes that invoice's client and service.
    const invoice = isRecordId(info.invoiceId) ? await getRecord('invoice', info.invoiceId) : null
    const client = invoice ? null : matchClient(clients, info)
    // The app puts GST on its own invoice line, so the invoice knows how much it was.
    const tax = invoice ? invoice.gst : info.tax
    record = {
      ...base,
      amount: txn.amount - tax,
      gst: tax,
      service: invoice?.lines[0]?.service ?? guessService(info.texts) ?? 'Other',
      clientId: invoice ? invoice.clientId : (client?.id ?? null),
      client: invoice?.client ?? client?.details.name ?? info.label,
      invoiceId: invoice?.id ?? null,
      chargeId: charge.id ?? null,
      description: charge.description ?? '',
    }
  } else {
    // A refund keeps the client and service of the payment it gives back.
    const chargeId = typeof txn.source === 'object' ? txn.source?.charge : null
    const original = chargeId ? (await listRecords('income')).find((i) => i.chargeId === chargeId) : null
    record = {
      ...base,
      amount: txn.amount,
      gst: 0,
      service: original?.service ?? 'Other',
      clientId: original?.clientId ?? null,
      client: original?.client ?? 'Stripe customer',
      description: 'Refund',
      refund: true,
    }
  }
  await saveRecord('income', record)
  return 1
}

// One expense per month for everything Stripe kept: card fees on payments
// (less fees returned on refunds) plus Stripe's own billing fees.
async function saveMonthlyFees(otherFees) {
  const income = (await listRecords('income')).filter((i) => i.source === 'stripe')
  const months = new Map()
  const add = (date, cents) => months.set(date.slice(0, 7), (months.get(date.slice(0, 7)) ?? 0) + cents)
  for (const i of income) add(i.date, i.fee || 0)
  for (const f of Object.values(otherFees)) add(f.date, f.amount)
  const now = new Date().toISOString()
  for (const [month, amount] of months) {
    const id = stripeRecordId(`fees:${month}`)
    const existing = await getRecord('expense', id)
    if (existing?.amount === amount) continue
    if (amount <= 0 && !existing) continue
    const [y, m] = month.split('-').map(Number)
    const lastDay = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
    await saveRecord('expense', {
      id,
      date: month === today().slice(0, 7) ? today() : lastDay,
      vendor: 'Stripe',
      category: 'Bank & payment fees',
      amount: Math.max(0, amount),
      gst: 0,
      paidWith: 'Taken from Stripe payouts',
      note: `Stripe fees for ${month}, added automatically`,
      receipt: false,
      source: 'stripe',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    })
  }
}

// Invoices sent from the app: paid or voided in Stripe shows here too.
async function refreshInvoices() {
  const open = (await listRecords('invoice')).filter((i) => i.status === 'open' && i.stripeInvoiceId)
  for (const inv of open) {
    const remote = await stripeGet(`invoices/${inv.stripeInvoiceId}`)
    const status = remote.status === 'paid' ? 'paid' : remote.status === 'void' || remote.status === 'uncollectible' ? 'void' : null
    if (!status) continue
    const paidAt = remote.status_transitions?.paid_at
    await saveRecord('invoice', {
      ...inv,
      status,
      paidOn: status === 'paid' ? (paidAt ? dateOf(paidAt) : today()) : null,
      updatedAt: new Date().toISOString(),
    })
  }
}

// Monthly recurring revenue from active subscriptions, after any coupon
// (like a referral discount), before GST.
async function monthlyRecurring() {
  let amount = 0
  let count = 0
  let after = null
  for (let page = 0; page < 10; page++) {
    const params = { status: 'active', limit: 100 }
    if (after) params.starting_after = after
    const list = await stripeGet('subscriptions', params)
    for (const sub of list.data) {
      count++
      let monthly = 0
      for (const item of sub.items?.data ?? []) {
        const price = item.price ?? {}
        const per = { day: 365 / 12, week: 52 / 12, month: 1, year: 1 / 12 }[price.recurring?.interval] ?? 1
        monthly += ((price.unit_amount ?? 0) * (item.quantity ?? 1) * per) / (price.recurring?.interval_count || 1)
      }
      const coupon = sub.discount?.coupon
      if (coupon?.percent_off) monthly *= 1 - coupon.percent_off / 100
      if (coupon?.amount_off) monthly -= coupon.amount_off
      amount += Math.max(0, Math.round(monthly))
    }
    if (!list.has_more || !list.data.length) break
    after = list.data.at(-1).id
  }
  return { amount, count }
}
