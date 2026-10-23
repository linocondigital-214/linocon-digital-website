// Work reminders in /admin: what's due for each client from their schedule
// (api/_lib/schedule.js), and whether it's done, so no month is missed.
import { addDays, clientSchedule } from '../../api/_lib/schedule.js'
import { countDone, monthLabel, monthlyItems, quarterlyItems, today } from './clientProgress'

// A Grow month is done once every item in it is ticked (or marked not needed).
export function monthDone(client, month) {
  const saved = client.months?.[month]
  if (!saved) return { added: false, done: false }
  const keys = Object.keys(client.months).sort()
  const quarterly = (keys.indexOf(month) + 1) % 3 === 0
  const count = countDone([...monthlyItems(), ...(quarterly ? quarterlyItems() : [])], saved.done, client.na)
  return { added: true, done: count.done >= count.total, ticked: count.done, total: count.total }
}

const startDone = (client) => Object.keys(client.done ?? {}).length > 0 || Object.keys(client.months ?? {}).length > 0

// Each client's work items up to a month ahead, oldest first:
// { client, item, title, done, state: 'done' | 'late' | 'today' | 'week' | 'later', month? }
export function workReminders(clients, paidOn = {}, now = today()) {
  const until = addDays(now, 31)
  const rows = []
  for (const client of clients) {
    const { items } = clientSchedule(client, client.paidOn ?? paidOn[client.id], until)
    for (const item of items) {
      if (item.kind === 'invoice') continue
      const month = item.kind === 'work' ? monthDone(client, item.month) : null
      const done = item.kind === 'start' ? startDone(client) : month.done
      const title = item.kind === 'start' ? 'Start the work' : `Month ${item.n} work (${monthLabel(item.month)})`
      const state = done ? 'done' : item.date < now ? 'late' : item.date === now ? 'today' : item.date <= addDays(now, 7) ? 'week' : 'later'
      rows.push({ client, item, title, done, state, month })
    }
  }
  return rows.sort((a, b) => a.item.date.localeCompare(b.item.date))
}
