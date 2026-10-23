// The invoice calendar in /finance: which monthly invoices are due, from each
// client's schedule (api/_lib/schedule.js), and which are already made.
import { addDays } from '../../api/_lib/schedule.js'

const MONTHLY = ['Grow Plan', 'Backlink Building', 'Grow Bundle']

// The invoice made for that client's month: one made from the calendar says
// which month it's for; an older one counts if it bills a monthly service
// around the due date.
export function invoiceFor(invoices, client, due) {
  const mine = invoices.filter((i) => i.clientId === client.id && i.status !== 'void')
  return (
    mine.find((i) => i.forMonth === due.month) ??
    mine.find((i) => {
      if (i.forMonth) return false
      const day = i.issued ?? i.createdAt?.slice(0, 10) ?? ''
      return day >= addDays(due.date, -10) && day < addDays(due.date, 20) && i.lines.some((l) => MONTHLY.includes(l.service))
    }) ??
    null
  )
}

// Every due invoice, oldest first: { client, due, invoice, state }.
//   state: 'made' | 'late' | 'today' | 'week' | 'later'
export function invoiceCalendar(clients, invoices, today) {
  const rows = []
  for (const client of clients) {
    for (const due of client.due ?? []) {
      const invoice = invoiceFor(invoices, client, due)
      const state = invoice ? 'made' : due.date < today ? 'late' : due.date === today ? 'today' : due.date <= addDays(today, 7) ? 'week' : 'later'
      rows.push({ client, due, invoice, state })
    }
  }
  return rows.sort((a, b) => a.due.date.localeCompare(b.due.date))
}

// The client's first month that still needs its invoice.
export const nextUnbilled = (client, invoices) => (client.due ?? []).find((d) => !invoiceFor(invoices, client, d))?.month ?? ''
