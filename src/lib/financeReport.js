import { buildXlsx } from './xlsx'

// The year's books arranged for an accountant: the totals the PDF summary
// shows and the sheets of the Excel workbook. `data` is /api/finance?op=export.

const dollars = (cents) => Math.round(cents ?? 0) / 100
const m = (cents) => ({ v: dollars(cents), money: true })
const mb = (cents) => ({ v: dollars(cents), money: true, bold: true })
const b = (v) => ({ v, bold: true })

export function yearTotals(data) {
  const { settings, income, expenses } = data
  const regd = settings.gstRegistered ? (settings.gstRegisteredOn ?? '0000-00-00') : null
  // Same as the year-end close: GST claimed back isn't a cost.
  const claimed = (e) => (regd && e.date >= regd ? e.gst || 0 : 0)

  const categories = new Map()
  for (const e of expenses) {
    const c = categories.get(e.category) ?? { name: e.category, count: 0, cost: 0, gst: 0 }
    c.count += 1
    c.cost += e.amount - claimed(e)
    c.gst += claimed(e)
    categories.set(e.category, c)
  }
  const services = new Map()
  for (const i of income) {
    const s = services.get(i.service) ?? { name: i.service, count: 0, amount: 0 }
    s.count += 1
    s.amount += i.amount
    services.set(i.service, s)
  }
  const byTotal = (key) => (a, z) => z[key] - a[key]
  return {
    open: !data.yearEnd.closed,
    byCategory: [...categories.values()].sort(byTotal('cost')),
    byService: [...services.values()].sort(byTotal('amount')),
    receipts: expenses.filter((e) => e.receipt).length,
    missingReceipts: expenses.filter((e) => !e.receipt && e.source !== 'stripe').length,
  }
}

export function workbook(data) {
  const { year, yearEnd: y, gst, balance, settings } = data
  const t = yearTotals(data)
  const asOf = t.open ? `so far, to ${data.today}` : `year ended Dec 31, ${year}`

  const summary = [
    [b(`LinoCon Digital: books for ${year}`)],
    [`Cash basis, ${asOf}. Prepared ${data.today}.`],
    settings.gstNumber ? [`GST number ${settings.gstNumber}`] : [settings.gstRegistered ? 'Registered for GST' : 'Not registered for GST'],
    [],
    [b('Profit')],
    ['Revenue (before GST)', m(y.revenue)],
    ['Expenses (after GST claimed back)', m(y.expenses)],
    [b('Profit'), mb(y.profit)],
    ['Owner took out', m(y.ownerOut)],
    [],
    [b('Cash in the bank')],
    ['Opening cash', m(y.opening)],
    ['Money in', m(y.cashIn)],
    ['Money out', m(y.cashOut)],
    [b(t.open ? 'Cash today' : 'Closing cash'), mb(y.closing)],
    [],
    ['Unpaid invoices', m(y.unpaid)],
    ['GST still owing', m(y.gstOwing)],
  ]

  const income = [
    [b('Date'), b('Client'), b('Service'), b('Amount before GST'), b('GST'), b('Total'), b('How paid'), b('Note')],
    ...data.income.map((i) => [
      i.date,
      i.client || '',
      i.service,
      m(i.amount),
      m(i.gst || 0),
      m(i.amount + (i.gst || 0)),
      i.source === 'stripe' ? (i.refund ? 'Stripe refund' : 'Stripe') : i.receivedBy || '',
      i.note || '',
    ]),
    [],
    [b('Total'), null, null, mb(sum(data.income, 'amount')), mb(sum(data.income, 'gst')), mb(sum(data.income, 'amount') + sum(data.income, 'gst'))],
  ]

  const expenses = [
    [b('Date'), b('Vendor'), b('Category'), b('Total paid'), b('GST'), b('Paid with'), b('Receipt'), b('Note')],
    ...data.expenses.map((e) => [
      e.date,
      e.vendor,
      e.category,
      m(e.amount),
      m(e.gst || 0),
      e.paidWith || '',
      e.receipt ? 'Yes' : e.source === 'stripe' ? 'Stripe statement' : 'No',
      e.note || '',
    ]),
    [],
    [b('Total'), null, null, mb(sum(data.expenses, 'amount')), mb(sum(data.expenses, 'gst'))],
  ]

  const categories = [
    [b('Category'), b('Entries'), b('Cost'), b('GST claimed back')],
    ...t.byCategory.map((c) => [c.name, c.count, m(c.cost), m(c.gst)]),
    [],
    [b('Total'), b(data.expenses.length), mb(y.expenses), mb(t.byCategory.reduce((s, c) => s + c.gst, 0))],
  ]

  const invoices = [
    [b('Number'), b('Client'), b('Sent'), b('Due'), b('Before GST'), b('GST'), b('Total'), b('Status'), b('Paid on')],
    ...data.invoices.map((inv) => [
      inv.number || '',
      inv.client,
      inv.sentOn ?? inv.issued ?? '',
      inv.due || '',
      m(inv.subtotal),
      m(inv.gst || 0),
      m(inv.subtotal + (inv.gst || 0)),
      { open: 'Unpaid', paid: 'Paid', void: 'Void' }[inv.status] ?? inv.status,
      inv.paidOn || '',
    ]),
  ]

  const moves = [[b('Date'), b('Type'), b('Amount'), b('Note')], ...data.moves.map((mv) => [mv.date, mv.type, m(mv.amount), mv.note || ''])]

  const gstRows = [
    [b('Period'), b('From'), b('To'), b('Sales (line 101)'), b('GST charged (line 105)'), b('GST claimed (line 108)'), b('Net (line 109)'), b('Due')],
    ...[...gst.quarters, gst.full].map((p) => [p.name, p.from, p.to, m(p.sales), m(p.charged), m(p.credits), m(p.net), (settings.gstRegistered && p.due) || '']),
  ]
  if (!settings.gstRegistered) gstRows.push([], ['Not registered for GST, so no GST is charged or claimed.'])

  const sheet = [
    [b(t.open ? `Balance sheet on ${balance.date}` : `Balance sheet on Dec 31, ${year}`)],
    [],
    [b('What the business owns')],
    ['Cash in the bank', m(balance.cash)],
    ['Unpaid invoices', m(balance.owedToYou)],
    ['Equipment', m(balance.equipment)],
    [b('Total owned'), mb(balance.assets)],
    [],
    [b('What the business owes')],
    ['GST owing', m(balance.gst)],
    ['Credit card', m(balance.card)],
    ['Loans', m(balance.loans)],
    ['Other', m(balance.other)],
    [b('Total owed'), mb(balance.liabilities)],
    [],
    [b('Owner’s equity'), mb(balance.equity)],
  ]

  return buildXlsx([
    { name: 'Summary', widths: [36, 16], rows: summary },
    { name: 'Income', widths: [12, 26, 22, 18, 12, 14, 14, 30], rows: income },
    { name: 'Expenses', widths: [12, 26, 24, 14, 12, 22, 16, 30], rows: expenses },
    { name: 'By category', widths: [28, 10, 14, 18], rows: categories },
    { name: 'Invoices', widths: [14, 26, 12, 12, 14, 12, 14, 10, 12], rows: invoices },
    { name: 'Owner & tax money', widths: [12, 24, 14, 30], rows: moves },
    { name: 'GST', widths: [10, 12, 12, 18, 22, 22, 16, 12], rows: gstRows },
    { name: 'Balance sheet', widths: [30, 16], rows: sheet },
  ])
}

const sum = (rows, key) => rows.reduce((s, r) => s + (r[key] || 0), 0)
