// The dashboard numbers, worked out from the saved records. Cash basis, like
// the Financial Log sheet: income counts when it's paid, expenses when they're
// paid. GST only counts from the registration date in Settings.

// Today's date in Vancouver, as 'YYYY-MM-DD'.
export function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

const monthKey = (date) => date.slice(0, 7)

function shiftMonth(key, by) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const lastDayOf = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
}

const sum = (rows, f) => rows.reduce((t, r) => t + (Number(f(r)) || 0), 0)

// What an expense costs the business: GST paid comes back as an input tax
// credit once registered, so it isn't a cost after that date.
function expenseCost(e, settings) {
  const claimable = settings.gstRegistered && settings.gstRegisteredOn && e.date >= settings.gstRegisteredOn
  return e.amount - (claimable ? e.gst || 0 : 0)
}

function quarterOf(key) {
  const [y, m] = key.split('-').map(Number)
  const q = Math.floor((m - 1) / 3)
  return { start: `${y}-${String(q * 3 + 1).padStart(2, '0')}`, end: `${y}-${String(q * 3 + 3).padStart(2, '0')}`, n: q + 1, year: y }
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthName = (key) => MONTH_NAMES[Number(key.slice(5)) - 1]

function gstStatus({ income, expenses, settings, now }) {
  const thisMonth = monthKey(now)
  if (!settings.gstRegistered) {
    // The $30,000 small supplier check: sales in the last four calendar
    // quarters, this one included.
    const q = quarterOf(thisMonth)
    const from = `${shiftMonth(q.start, -9)}-01`
    const sales = sum(income.filter((i) => i.date >= from && i.date <= now), (i) => i.amount)
    return { registered: false, salesLast4Quarters: sales, limit: 3_000_000, from }
  }
  const regd = settings.gstRegisteredOn ?? '0000-00-00'
  let start, end, label, due
  if (settings.gstFiling === 'Quarterly') {
    const q = quarterOf(thisMonth)
    start = `${q.start}-01`
    end = lastDayOf(q.end)
    label = `${monthName(q.start)}-${monthName(q.end)}`
    due = lastDayOf(shiftMonth(q.end, 1))
  } else {
    const y = now.slice(0, 4)
    start = `${y}-01-01`
    end = `${y}-12-31`
    label = y
    due = `${Number(y) + 1}-04-30` // sole proprietor payment date; confirm with accountant
  }
  const inPeriod = (r) => r.date >= start && r.date <= end && r.date >= regd
  const collected = sum(income.filter(inPeriod), (i) => i.gst)
  const credits = sum(expenses.filter(inPeriod), (e) => e.gst)
  return { registered: true, label, due, collected, credits, owing: collected - credits }
}

export function summarize({ income, expenses, invoices, settings }, now = today()) {
  const thisMonth = monthKey(now)
  const lastMonth = shiftMonth(thisMonth, -1)
  const year = now.slice(0, 4)
  const inMonth = (key) => (r) => monthKey(r.date) === key
  const inYear = (r) => r.date.startsWith(year) && r.date <= now

  const revenue = sum(income.filter(inMonth(thisMonth)), (i) => i.amount)
  const revenueBefore = sum(income.filter(inMonth(lastMonth)), (i) => i.amount)
  const spent = sum(expenses.filter(inMonth(thisMonth)), (e) => expenseCost(e, settings))

  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(thisMonth, i - 5)).map((key) => ({
    key,
    label: monthName(key),
    revenue: sum(income.filter(inMonth(key)), (i) => i.amount),
    expenses: sum(expenses.filter(inMonth(key)), (e) => expenseCost(e, settings)),
  }))

  const totals = (rows, keyOf, valueOf) => {
    const map = new Map()
    for (const r of rows) map.set(keyOf(r), (map.get(keyOf(r)) ?? 0) + valueOf(r))
    return [...map].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount)
  }

  const open = invoices.filter((inv) => inv.status === 'open')
  const overdue = open.filter((inv) => inv.due && inv.due < now)
  const owed = (inv) => inv.subtotal + (inv.gst || 0)

  // Cash: the opening balance Lino types in Settings, plus money in, less
  // money out since then.
  const since = (r) => !settings.openingDate || r.date >= settings.openingDate
  const cash =
    settings.openingCash +
    sum(income.filter(since), (i) => i.amount + (i.gst || 0) - (i.fee || 0)) -
    sum(expenses.filter(since), (e) => e.amount)

  const attention = overdue.map((inv) => ({
    tone: 'late',
    title: `${inv.client} is ${daysBetween(inv.due, now)} days late`,
    detail: `Invoice ${inv.number}`,
    amount: owed(inv),
  }))
  const noReceipt = expenses.filter((e) => inYear(e) && !e.receipt)
  if (noReceipt.length) {
    attention.push({
      tone: 'warn',
      title: `${noReceipt.length} ${noReceipt.length === 1 ? 'receipt' : 'receipts'} missing`,
      detail: noReceipt.slice(0, 3).map((e) => e.vendor).join(', '),
    })
  }

  return {
    today: now,
    ownerName: settings.ownerName,
    month: { key: thisMonth, revenue, revenueBefore, expenses: spent, profit: revenue - spent },
    months,
    cash,
    cashAsOf: settings.openingDate,
    unpaid: { amount: sum(open, owed), count: open.length, overdue: overdue.length },
    gst: gstStatus({ income, expenses, settings, now }),
    byService: totals(income.filter(inYear), (i) => i.service || 'Other', (i) => i.amount),
    byCategory: totals(expenses.filter(inYear), (e) => e.category || 'Other', (e) => expenseCost(e, settings)),
    attention,
    counts: { income: income.length, expenses: expenses.length, invoices: invoices.length },
  }
}

function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)
}
