// Calls to /api/finance (see api/finance.js) and money formatting for the
// private finance app at /finance. The session is an HttpOnly cookie the
// browser sends by itself; nothing secret is kept in page storage.

export class FinanceError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (${status})`)
    this.status = status
    this.code = body?.error
  }
}

async function call(op, { method = 'GET', body } = {}) {
  const options = { method, credentials: 'same-origin' }
  if (body) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }
  const res = await fetch(`/api/finance?op=${op}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new FinanceError(res.status, data)
  return data
}

export const fetchStatus = () => call('status')
export const sendPassword = (password) => call('password', { method: 'POST', body: { password } })
export const sendCode = (ticket, code) => call('code', { method: 'POST', body: { ticket, code } })
export const signOutFinance = () => call('signout', { method: 'POST', body: {} })
export const fetchSummary = () => call('summary')

const dollars = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol' })
const wholeDollars = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

// Amounts are whole cents.
export const money = (cents) => dollars.format((cents ?? 0) / 100)
export const moneyShort = (cents) => wholeDollars.format((cents ?? 0) / 100)

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const monthTitle = (key) => `${MONTHS[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`
export const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })

export function greeting(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver', hour: 'numeric', hourCycle: 'h23' }).format(date))
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

// The sections of the app. The ones not built yet show a short note.
export const SECTIONS = [
  { key: '', name: 'Dashboard', short: 'Home', icon: 'dashboard' },
  { key: 'income', name: 'Income', icon: 'income', soon: 'Stripe payments, matched to your clients, arrive here in the next update.' },
  { key: 'invoices', name: 'Invoices', icon: 'invoice', soon: 'Invoices with GST added and a Pay now button through Stripe come in the next update.' },
  { key: 'expenses', name: 'Expenses', icon: 'expense', soon: 'Adding expenses with a receipt photo, sorted into categories for you, comes in the next update.' },
  { key: 'gst', name: 'GST & Year-End', short: 'GST', icon: 'gst', soon: 'GST totals, the year-end close and balance sheets to 2030 come after income and expenses.' },
  { key: 'export', name: 'Export', icon: 'export', soon: 'Excel and PDF exports for your accountant come with the GST and year-end update.' },
  { key: 'access', name: 'Access', icon: 'access', soon: 'A limited bookkeeper login (view and add only) can be added here later.' },
]
