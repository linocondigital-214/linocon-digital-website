// The invoice calls behind /api/finance:
//   GET  ?op=invoices        every invoice (newest first), clients and choices for the form;
//                            clients with a signed agreement come with their file number
//                            and package, so typing the file number fills in an invoice,
//                            and monthly clients with the dates their invoices are due
//   POST ?op=invoice-save    { id?, invoice }  a new draft, or changes to a draft
//   POST ?op=invoice-send    { id, stripe }    stripe: true has Stripe email it with a Pay now link;
//                                              false marks it sent by Lino (owner only)
//   POST ?op=invoice-paid    { id, date, receivedBy }  paid outside Stripe; adds the income (owner only)
//   POST ?op=invoice-void    { id }  (owner only)
//   POST ?op=invoice-delete  { id }  drafts only (owner only)
import { listClients, saveClient } from '../store.js'
import { ensureFileNo } from '../fileNo.js'
import { firstPaidByClient } from '../paid.js'
import { notifyClients } from '../progressMail.js'
import { addDays, clientSchedule } from '../schedule.js'
import { can } from './roles.js'
import { RECEIVED_BY, SERVICES } from './income.js'
import { DUE_DAYS, chargesGst, cleanInvoice, markPaidInStripe, nextNumber, sendThroughStripe, voidInStripe } from './invoices.js'
import { Invalid } from './expenses.js'
import { deleteRecord, getRecord, getSettings, isRecordId, listRecords, newRecordId, saveRecord } from './records.js'
import { stripeKey } from './stripe.js'
import { today } from './summary.js'

const denied = [403, { error: 'role', message: 'Your login can’t do that.' }]
const missing = [404, { error: 'missing', message: 'That invoice was already removed.' }]
const byNewest = (a, b) => (b.issued ?? '').localeCompare(a.issued ?? '') || b.createdAt.localeCompare(a.createdAt)

async function load(req) {
  const id = req.body?.id
  return isRecordId(id) ? getRecord('invoice', id) : null
}

const stamp = (invoice) => ({ ...invoice, updatedAt: new Date().toISOString() })

export async function invoiceOps(op, req, user) {
  const get = req.method === 'GET'
  const post = req.method === 'POST'

  if (op === 'invoices' && get) {
    if (!can(user.role, 'view')) return denied
    const [invoices, clients, settings] = await Promise.all([listRecords('invoice'), listClients(), getSettings()])
    for (const c of clients) if (await ensureFileNo(c)) await saveClient(c)
    const paid = await firstPaidByClient()
    // Monthly invoices due up to two months ahead, for the invoice calendar.
    const until = addDays(today(), 62)
    const dueOf = (c) => clientSchedule(c, paid[c.id], until).items.filter((i) => i.kind === 'invoice').map(({ date, month, n }) => ({ date, month, n }))
    return [
      200,
      {
        invoices: invoices.sort(byNewest),
        clients: clients
          .map((c) => ({
            id: c.id,
            name: c.details.name,
            email: c.details.email ?? '',
            ...(c.fileNo ? { fileNo: c.fileNo, package: c.docs?.package ?? null, due: dueOf(c) } : {}),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        services: SERVICES,
        dueDays: DUE_DAYS,
        receivedBy: RECEIVED_BY,
        gst: chargesGst(settings, today()),
        stripe: Boolean(stripeKey()),
        canEdit: can(user.role, 'edit'),
        canDelete: can(user.role, 'delete'),
      },
    ]
  }

  if (op === 'invoice-save' && post) {
    const existing = req.body?.id ? await load(req) : null
    if (req.body?.id && !existing) return missing
    if (!can(user.role, existing ? 'edit' : 'add')) return denied
    if (existing && existing.status !== 'draft') throw new Invalid('This invoice was already sent, so it can’t be changed. Void it and make a new one.')
    const fields = cleanInvoice(req.body?.invoice, await listClients(), await getSettings())
    const now = new Date().toISOString()
    const invoice = existing
      ? { ...existing, ...fields, updatedAt: now }
      : { id: newRecordId(), number: null, status: 'draft', ...fields, createdAt: now, updatedAt: now }
    await saveRecord('invoice', invoice)
    return [existing ? 200 : 201, { invoice }]
  }

  if (op === 'invoice-send' && post) {
    if (!can(user.role, 'edit')) return denied
    const invoice = await load(req)
    if (!invoice) return missing
    if (invoice.status !== 'draft') throw new Invalid('This invoice was already sent.')
    const viaStripe = Boolean(req.body?.stripe)
    if (viaStripe && !stripeKey()) throw new Invalid('Stripe isn’t connected yet, so it can’t send invoices.')
    const settings = await getSettings()
    // The date it goes out is the invoice date, so GST and the due date follow it.
    const issued = today()
    const ready = { ...invoice, ...cleanInvoice({ ...invoice, issued }, await listClients(), settings) }
    if (viaStripe && !ready.email) throw new Invalid('Add the client’s email so Stripe can send the invoice.')
    ready.number = invoice.number ?? (await nextNumber(issued))
    await saveRecord('invoice', stamp(ready))
    const stripe = viaStripe ? await sendThroughStripe(ready, settings) : {}
    const sent = stamp({ ...ready, ...stripe, status: 'open', sentOn: issued, sentBy: viaStripe ? 'stripe' : 'self' })
    await saveRecord('invoice', sent)
    return [200, { invoice: sent }]
  }

  if (op === 'invoice-paid' && post) {
    if (!can(user.role, 'edit')) return denied
    const invoice = await load(req)
    if (!invoice) return missing
    if (invoice.status !== 'open') throw new Invalid('Only a sent, unpaid invoice can be marked paid.')
    const date = typeof req.body?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.body.date) ? req.body.date : today()
    const receivedBy = RECEIVED_BY.includes(req.body?.receivedBy) ? req.body.receivedBy : RECEIVED_BY[0]
    if (invoice.stripeInvoiceId) await markPaidInStripe(invoice.stripeInvoiceId)
    const now = new Date().toISOString()
    await saveRecord('income', {
      id: newRecordId(),
      date,
      amount: invoice.subtotal,
      gst: invoice.gst,
      fee: 0,
      service: invoice.lines[0]?.service ?? 'Other',
      clientId: invoice.clientId,
      client: invoice.client,
      note: `Invoice ${invoice.number}`,
      receivedBy,
      source: 'manual',
      invoiceId: invoice.id,
      createdAt: now,
      updatedAt: now,
    })
    const paid = stamp({ ...invoice, status: 'paid', paidOn: date })
    await saveRecord('invoice', paid)
    await notifyClients([paid.clientId])
    return [200, { invoice: paid }]
  }

  if (op === 'invoice-void' && post) {
    if (!can(user.role, 'edit')) return denied
    const invoice = await load(req)
    if (!invoice) return missing
    if (invoice.status !== 'open') throw new Invalid('Only a sent, unpaid invoice can be voided.')
    if (invoice.stripeInvoiceId) await voidInStripe(invoice.stripeInvoiceId)
    const voided = stamp({ ...invoice, status: 'void' })
    await saveRecord('invoice', voided)
    return [200, { invoice: voided }]
  }

  if (op === 'invoice-delete' && post) {
    if (!can(user.role, 'delete')) return denied
    const invoice = await load(req)
    if (!invoice) return missing
    if (invoice.status !== 'draft') throw new Invalid('Sent invoices stay in the books. You can void one instead.')
    await deleteRecord('invoice', invoice.id)
    return [200, { deleted: invoice.id }]
  }

  return null
}
