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
export const fetchExpenses = () => call('expenses')
export const suggestFor = (vendor) => call(`suggest&vendor=${encodeURIComponent(vendor)}`).then((d) => d.suggestion)
export const fetchReceipt = (id) => call(`receipt&id=${encodeURIComponent(id)}`).then((d) => d.dataUrl)
export const addExpense = (expense, receipt) => call('expense-add', { method: 'POST', body: { expense, receipt } }).then((d) => d.expense)
export const editExpense = (id, expense, receipt, removeReceipt) =>
  call('expense-edit', { method: 'POST', body: { id, expense, receipt, removeReceipt } }).then((d) => d.expense)
export const deleteExpense = (id) => call('expense-delete', { method: 'POST', body: { id } })
export const fetchIncome = () => call('income')
export const syncStripe = (force = false) => call('stripe-sync', { method: 'POST', body: { force } }).then((d) => d.stripe)
export const addIncome = (income) => call('income-add', { method: 'POST', body: { income } }).then((d) => d.income)
export const editIncome = (id, income) => call('income-edit', { method: 'POST', body: { id, income } }).then((d) => d.income)
export const deleteIncome = (id) => call('income-delete', { method: 'POST', body: { id } })

// "$1,234.50" or "12" -> 123450 cents; null when it isn't an amount.
export function toCents(text) {
  const clean = String(text ?? '').replace(/[$,\s]/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return null
  const [whole, part = ''] = clean.split('.')
  return Number(whole) * 100 + Number(part.padEnd(2, '0'))
}

export const centsToText = (cents) => (cents ? (cents / 100).toFixed(2) : '')

// Shrinks a phone photo to a JPEG small enough to save (about 1600px on the
// long side), so a receipt uploads quickly even on mobile data.
export async function shrinkPhoto(file, maxSide = 1600) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('That photo couldn’t be read. Try another one.'))
      i.src = url
    })
    let side = maxSide
    for (let quality = 0.8; ; quality -= 0.1) {
      const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      if (dataUrl.length < 1_000_000 || quality < 0.45) return dataUrl
      side = Math.round(side * 0.85)
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

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
  { key: 'income', name: 'Income', icon: 'income' },
  { key: 'invoices', name: 'Invoices', icon: 'invoice', soon: 'Invoices with GST added and a Pay now button through Stripe come in the next update.' },
  { key: 'expenses', name: 'Expenses', icon: 'expense' },
  { key: 'gst', name: 'GST & Year-End', short: 'GST', icon: 'gst', soon: 'GST totals, the year-end close and balance sheets to 2030 come after income and expenses.' },
  { key: 'export', name: 'Export', icon: 'export', soon: 'Excel and PDF exports for your accountant come with the GST and year-end update.' },
  { key: 'access', name: 'Access', icon: 'access', soon: 'A limited bookkeeper login (view and add only) can be added here later.' },
]
