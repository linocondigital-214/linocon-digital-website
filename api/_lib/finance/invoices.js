// Invoices: what the form sends, the totals, and sending through Stripe.
// Stripe emails the client a link with a Pay now button; when they pay, the
// next sync marks the invoice paid and the payment lands in Income.
import { redis } from '../store.js'
import { Invalid } from './expenses.js'
import { SERVICES } from './income.js'
import { stripeDelete, stripeGet, stripePost } from './stripe.js'
import { today } from './summary.js'

export const DUE_DAYS = [7, 14, 30]
export const GST_RATE = 0.05

const DATE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// GST goes on once Lino is registered, from the registration date.
export const chargesGst = (settings, issued) =>
  Boolean(settings.gstRegistered && (!settings.gstRegisteredOn || issued >= settings.gstRegisteredOn))

// Checks a draft from the page. Line amounts arrive as whole cents.
export function cleanInvoice(input = {}, clients, settings) {
  const client = input.clientId ? clients.find((c) => c.id === input.clientId) : null
  if (input.clientId && !client) throw new Invalid('That client isn’t in your client list any more.')
  const name = client?.details.name ?? text(input.client, 80)
  if (!name) throw new Invalid('Pick a client or type who the invoice is for.')
  const email = text(input.email, 120)
  if (email && !EMAIL.test(email)) throw new Invalid('That email address doesn’t look right.')

  const issued = text(input.issued, 10) || today()
  if (!DATE.test(issued) || Number.isNaN(Date.parse(issued))) throw new Invalid('Pick the invoice date.')
  const dueDays = DUE_DAYS.includes(input.dueDays) ? input.dueDays : 14

  const lines = (Array.isArray(input.lines) ? input.lines : []).slice(0, 10).map((l) => ({
    description: text(l?.description, 120),
    service: SERVICES.includes(l?.service) ? l.service : 'Other',
    // Below zero for a saving or discount, like a package's bundle saving.
    amount: Number.isInteger(l?.amount) && l.amount !== 0 && Math.abs(l.amount) <= 100_000_000 ? l.amount : null,
  }))
  if (!lines.length) throw new Invalid('Add at least one line.')
  for (const l of lines) {
    if (!l.description) throw new Invalid('Every line needs a description.')
    if (!l.amount) throw new Invalid(`Type an amount for “${l.description}”.`)
  }
  const subtotal = lines.reduce((t, l) => t + l.amount, 0)
  if (subtotal <= 0) throw new Invalid('The invoice total has to be more than $0.')
  const gst = chargesGst(settings, issued) ? Math.round(subtotal * GST_RATE) : 0
  return {
    clientId: client?.id ?? null,
    client: name,
    email,
    issued,
    dueDays,
    due: addDays(issued, dueDays),
    lines,
    subtotal,
    gst,
    note: text(input.note, 500),
    fileNo: text(input.fileNo, 20).toUpperCase(),
  }
}

// LCD-2026-001, counting up through each year.
export async function nextNumber(issued) {
  const year = issued.slice(0, 4)
  const n = await redis(['INCR', `fin:invoice:counter:${year}`])
  return `LCD-${year}-${String(n).padStart(3, '0')}`
}

// Stripe's extra boxes on the invoice, skipping empty ones.
function customFields(pairs) {
  return Object.fromEntries(
    pairs
      .filter(([, value]) => value)
      .flatMap(([name, value], i) => [
        [`custom_fields[${i + 1}][name]`, name],
        [`custom_fields[${i + 1}][value]`, value],
      ]),
  )
}

async function findCustomer(invoice) {
  const found = await stripeGet('customers', { email: invoice.email, limit: 1 })
  if (found.data?.[0]) return found.data[0].id
  const made = await stripePost('customers', { email: invoice.email, name: invoice.client })
  return made.id
}

// Creates the invoice in Stripe and has Stripe email it. If a step fails
// part way, the half-made Stripe draft is removed so nothing goes out.
export async function sendThroughStripe(invoice, settings) {
  if (!invoice.email) throw new Invalid('Add the client’s email so Stripe can send the invoice.')
  const customer = await findCustomer(invoice)
  const draft = await stripePost('invoices', {
    customer,
    currency: 'cad',
    collection_method: 'send_invoice',
    days_until_due: invoice.dueDays,
    pending_invoice_items_behavior: 'exclude',
    auto_advance: 'false',
    description: invoice.note || `Invoice ${invoice.number} from LinoCon Digital`,
    'metadata[lcd_invoice]': invoice.id,
    'custom_fields[0][name]': 'Invoice',
    'custom_fields[0][value]': invoice.number,
    ...customFields([
      ['File no.', invoice.fileNo],
      ['GST no.', settings.gstNumber],
    ]),
  })
  try {
    const items = invoice.lines.map((l) => ({ amount: l.amount, description: l.description }))
    if (invoice.gst) items.push({ amount: invoice.gst, description: 'GST (5%)' })
    for (const item of items) {
      await stripePost('invoiceitems', { customer, invoice: draft.id, currency: 'cad', ...item })
    }
    const final = await stripePost(`invoices/${draft.id}/finalize`, { auto_advance: 'false' })
    await stripePost(`invoices/${draft.id}/send`)
    return { stripeInvoiceId: draft.id, payUrl: final.hosted_invoice_url ?? null, pdfUrl: final.invoice_pdf ?? null }
  } catch (err) {
    await stripeDelete(`invoices/${draft.id}`).catch(() => {})
    throw err
  }
}

export const markPaidInStripe = (stripeInvoiceId) => stripePost(`invoices/${stripeInvoiceId}/pay`, { paid_out_of_band: 'true' })
export const voidInStripe = (stripeInvoiceId) => stripePost(`invoices/${stripeInvoiceId}/void`)
