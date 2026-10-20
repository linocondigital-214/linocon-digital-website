// GST returns, the year-end close and balance sheets, worked out the same way
// as the Financial Log sheet (finance/source/build_ledger.py): cash basis, GST
// only from the registration date, each year's closing cash carried forward.
//
// "Moves" are the Owner & Tax money that is neither income nor an expense:
// Lino's own money in or out, GST and income tax paid, loans, card payoffs.

export const MOVE_TYPES = [
  'Owner put money in',
  'Owner took money out',
  'GST paid to CRA',
  'Income tax paid',
  'Loan received',
  'Loan payment',
  'Paid off credit card',
]
const MONEY_IN = ['Owner put money in', 'Loan received']
const MONEY_OUT = ['Owner took money out', 'GST paid to CRA', 'Income tax paid', 'Loan payment', 'Paid off credit card']

export const LAST_YEAR = 2030

const sum = (rows, f) => rows.reduce((t, r) => t + (Number(f(r)) || 0), 0)
const between = (from, to) => (r) => (!from || r.date >= from) && (!to || r.date <= to)
const movesOf = (moves, type, from, to) => sum(moves.filter((m) => m.type === type && between(from, to)(m)), (m) => m.amount)

// An expense leaves the business account unless it went on the credit card
// (it leaves when the card is paid off) or Lino paid it personally.
const paidFromBusiness = (e) => e.paidWith !== 'Credit card' && e.paidWith !== 'Personal money'

const gstFrom = (settings) => (settings.gstRegistered ? (settings.gstRegisteredOn ?? '0000-00-00') : null)

// Money in and out of the business account between two dates (inclusive).
function cashFlow({ income, expenses, moves }, from, to) {
  const inRange = between(from, to)
  const cashIn = sum(income.filter(inRange), (i) => i.amount + (i.gst || 0)) + sum(MONEY_IN, (t) => movesOf(moves, t, from, to))
  const cashOut = sum(expenses.filter((e) => inRange(e) && paidFromBusiness(e)), (e) => e.amount) + sum(MONEY_OUT, (t) => movesOf(moves, t, from, to))
  return { cashIn, cashOut }
}

// Cash in the business account at the end of a day: the opening balance in
// Settings plus everything since the opening date.
export function cashOn(data, date) {
  const { cashIn, cashOut } = cashFlow(data, data.settings.openingDate, date)
  return data.settings.openingCash + cashIn - cashOut
}

// What an expense costs once GST paid on it is claimed back.
function expenseCost(e, settings) {
  const regd = gstFrom(settings)
  return e.amount - (regd && e.date >= regd ? e.gst || 0 : 0)
}

// GST charged less GST claimed (ITCs) less GST already paid, up to a date.
function gstOwing({ income, expenses, moves, settings }, to) {
  const regd = gstFrom(settings)
  if (!regd) return 0
  const charged = sum(income.filter(between(regd, to)), (i) => i.gst)
  const credits = sum(expenses.filter(between(regd, to)), (e) => e.gst)
  return charged - credits - movesOf(moves, 'GST paid to CRA', null, to)
}

// Invoices sent by a date and not yet paid on it.
function unpaidOn(invoices, date) {
  return sum(
    invoices.filter((inv) => {
      const sent = inv.sentOn ?? inv.issued
      if (!sent || sent > date || inv.status === 'draft' || inv.status === 'void') return false
      return inv.status === 'open' || (inv.status === 'paid' && inv.paidOn > date)
    }),
    (inv) => inv.subtotal + (inv.gst || 0),
  )
}

const pad = (n) => String(n).padStart(2, '0')
const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)

// The four quarters and the full year, as on the sheet's GST tab.
export function gstYear(data, year) {
  const { income, expenses, settings } = data
  const regd = gstFrom(settings)
  const period = (name, from, to, due) => {
    const sales = sum(income.filter(between(from, to)), (i) => i.amount)
    const charged = sum(income.filter(between(from, to)), (i) => i.gst)
    const credits = regd ? sum(expenses.filter((e) => between(from, to)(e) && e.date >= regd), (e) => e.gst) : 0
    return { name, from, to, sales, charged, credits, net: charged - credits, due }
  }
  const quarterly = settings.gstFiling === 'Quarterly'
  const quarters = [0, 1, 2, 3].map((q) => {
    const to = lastDay(year, q * 3 + 3)
    const due = quarterly ? lastDay(q === 3 ? year + 1 : year, q === 3 ? 1 : q * 3 + 4) : null
    return period(`Q${q + 1}`, `${year}-${pad(q * 3 + 1)}-01`, to, due)
  })
  const full = period('Full year', `${year}-01-01`, `${year}-12-31`, quarterly ? null : `${year + 1}-04-30`)
  return { year, quarters, full }
}

// The $30,000 small supplier check: each of the last four calendar
// quarters, this one included.
export function smallSupplier({ income, settings }, today) {
  const y = Number(today.slice(0, 4))
  const q = Math.floor((Number(today.slice(5, 7)) - 1) / 3)
  const quarters = [3, 2, 1, 0].map((back) => {
    const n = y * 4 + q - back
    const qy = Math.floor(n / 4)
    const qn = n % 4
    const from = `${qy}-${pad(qn * 3 + 1)}-01`
    const to = lastDay(qy, qn * 3 + 3)
    return { name: `Q${qn + 1} ${qy}`, from, to, sales: sum(income.filter(between(from, to)), (i) => i.amount) }
  })
  const total = sum(quarters, (x) => x.sales)
  const biggest = Math.max(...quarters.map((x) => x.sales))
  const status = settings.gstRegistered
    ? 'registered'
    : total > 3_000_000 || biggest > 3_000_000
      ? 'over'
      : total >= 2_400_000
        ? 'close'
        : 'under'
  return { quarters, total, biggest, limit: 3_000_000, status }
}

// One row per year from the opening year to 2030: each year's closing cash
// is the next year's opening cash.
export function yearEnd(data, today) {
  const first = Number((data.settings.openingDate ?? today).slice(0, 4))
  const rows = []
  let opening = data.settings.openingCash
  for (let year = first; year <= Math.max(first, LAST_YEAR); year++) {
    const from = `${year}-01-01`
    const to = `${year}-12-31`
    const { cashIn, cashOut } = cashFlow(data, data.settings.openingDate && data.settings.openingDate > from ? data.settings.openingDate : from, to)
    const revenue = sum(data.income.filter(between(from, to)), (i) => i.amount)
    const spent = sum(data.expenses.filter(between(from, to)), (e) => expenseCost(e, data.settings))
    const closing = opening + cashIn - cashOut
    rows.push({
      year,
      opening,
      cashIn,
      cashOut,
      closing,
      revenue,
      expenses: spent,
      profit: revenue - spent,
      ownerOut: movesOf(data.moves, 'Owner took money out', from, to),
      unpaid: unpaidOn(data.invoices, to),
      gstOwing: gstOwing(data, to),
      closed: to < today,
    })
    opening = closing
  }
  return rows
}

// What the business owns and owes on a date.
export function balanceSheet(data, date, { withTyped = false } = {}) {
  const { expenses, moves, settings } = data
  const cash = cashOn(data, date)
  const owedToYou = unpaidOn(data.invoices, date)
  const equipment = withTyped ? settings.equipment || 0 : 0
  const card =
    sum(expenses.filter((e) => e.paidWith === 'Credit card' && e.date <= date), (e) => e.amount) - movesOf(moves, 'Paid off credit card', null, date)
  const loans = movesOf(moves, 'Loan received', null, date) - movesOf(moves, 'Loan payment', null, date)
  const gst = gstOwing(data, date)
  const other = withTyped ? settings.otherOwed || 0 : 0
  const assets = cash + owedToYou + equipment
  const liabilities = gst + card + loans + other
  return { date, cash, owedToYou, equipment, assets, gst, card, loans, other, liabilities, equity: assets - liabilities }
}
