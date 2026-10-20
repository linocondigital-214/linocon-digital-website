// The GST, year-end and settings calls behind /api/finance:
//   GET  ?op=books&year=    GST periods for a year, the $30,000 check, year-end rows,
//                           balance sheets and the owner & tax money list
//   GET  ?op=settings       the settings
//   POST ?op=settings-save  { settings }  (owner only)
//   POST ?op=move-add       { move }      owner & tax money: own money in or out, GST paid, loans...
//   POST ?op=move-delete    { id }        (owner only)
import { can } from './roles.js'
import { Invalid } from './expenses.js'
import { LAST_YEAR, MOVE_TYPES, balanceSheet, gstYear, smallSupplier, yearEnd } from './books.js'
import { deleteRecord, getRecord, getSettings, isRecordId, listRecords, newRecordId, saveRecord } from './records.js'
import { redis } from '../store.js'
import { today } from './summary.js'

const denied = [403, { error: 'role', message: 'Your login can’t do that.' }]
const DATE = /^\d{4}-\d{2}-\d{2}$/
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const isDate = (v) => typeof v === 'string' && DATE.test(v) && !Number.isNaN(Date.parse(v))
const cents = (v, { min = 0 } = {}) => (Number.isInteger(v) && v >= min && v <= 100_000_000 ? v : null)

export async function loadBooks() {
  const [income, expenses, invoices, moves, settings] = await Promise.all([
    listRecords('income'),
    listRecords('expense'),
    listRecords('invoice'),
    listRecords('move'),
    getSettings(),
  ])
  return { income, expenses, invoices, moves, settings }
}

export function cleanSettings(input = {}, current) {
  const next = { ...current }
  next.ownerName = text(input.ownerName, 40) || current.ownerName
  if (input.openingDate !== undefined) {
    if (input.openingDate && !isDate(input.openingDate)) throw new Invalid('Pick the date your starting balance is from.')
    next.openingDate = input.openingDate || null
  }
  if (input.openingCash !== undefined) {
    const v = cents(input.openingCash, { min: -100_000_000 })
    if (v === null) throw new Invalid('Type your starting bank balance, like 1250.00.')
    next.openingCash = v
  }
  next.gstRegistered = Boolean(input.gstRegistered)
  if (next.gstRegistered) {
    if (!isDate(input.gstRegisteredOn)) throw new Invalid('Pick the date your GST registration starts.')
    next.gstRegisteredOn = input.gstRegisteredOn
  } else {
    next.gstRegisteredOn = null
  }
  next.gstFiling = input.gstFiling === 'Quarterly' ? 'Quarterly' : 'Annual'
  const number = text(input.gstNumber, 20).toUpperCase()
  if (number && !/^\d{9} ?RT ?\d{4}$/.test(number)) throw new Invalid('A GST number looks like 123456789 RT0001.')
  next.gstNumber = number
  for (const key of ['equipment', 'otherOwed']) {
    if (input[key] === undefined) continue
    const v = cents(input[key])
    if (v === null) throw new Invalid('Type amounts like 1250.00.')
    next[key] = v
  }
  return next
}

export function cleanMove(input = {}) {
  if (!isDate(input.date)) throw new Invalid('Pick the date.')
  if (!MOVE_TYPES.includes(input.type)) throw new Invalid('Pick what kind of money this was.')
  const amount = cents(input.amount)
  if (!amount) throw new Invalid('Type the amount.')
  return { date: input.date, type: input.type, amount, note: text(input.note, 200) }
}

export async function booksOps(op, req, user) {
  const get = req.method === 'GET'
  const post = req.method === 'POST'

  if (op === 'books' && get) {
    if (!can(user.role, 'view')) return denied
    const data = await loadBooks()
    const now = today()
    const rows = yearEnd(data, now)
    const year = Number(req.query?.year) || Number(now.slice(0, 4))
    const years = rows.map((r) => r.year)
    return [
      200,
      {
        today: now,
        settings: data.settings,
        gst: gstYear(data, years.includes(year) ? year : Number(now.slice(0, 4))),
        years,
        check: smallSupplier(data, now),
        yearEnd: rows,
        balance: {
          today: balanceSheet(data, now, { withTyped: true }),
          years: rows.filter((r) => r.closed).map((r) => ({ year: r.year, ...balanceSheet(data, `${r.year}-12-31`) })),
        },
        moves: data.moves.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
        moveTypes: MOVE_TYPES,
        lastYear: LAST_YEAR,
        canDelete: can(user.role, 'delete'),
        canSettings: can(user.role, 'settings'),
      },
    ]
  }

  if (op === 'settings' && get) {
    if (!can(user.role, 'view')) return denied
    return [200, { settings: await getSettings(), canSettings: can(user.role, 'settings') }]
  }

  if (op === 'settings-save' && post) {
    if (!can(user.role, 'settings')) return denied
    const settings = cleanSettings(req.body?.settings, await getSettings())
    await redis(['SET', 'fin:settings', JSON.stringify(settings)])
    return [200, { settings }]
  }

  if (op === 'move-add' && post) {
    if (!can(user.role, 'add')) return denied
    const move = { id: newRecordId(), ...cleanMove(req.body?.move), createdAt: new Date().toISOString() }
    await saveRecord('move', move)
    return [201, { move }]
  }

  if (op === 'move-delete' && post) {
    if (!can(user.role, 'delete')) return denied
    const id = req.body?.id
    if (!isRecordId(id) || !(await getRecord('move', id))) return [404, { error: 'missing' }]
    await deleteRecord('move', id)
    return [200, { deleted: id }]
  }

  return null
}
