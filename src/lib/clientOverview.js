// The all-clients overview on /clients: where each client is, this month's
// Grow work, what needs Lino's attention, and the private work log.
import { DOCS, docState, statusLabel } from './clientDocs'
import { countDone, currentStage, monthlyItems, overallProgress, percent, quarterlyItems, today } from './clientProgress'

// How long without any update before a client shows under "Needs attention".
export const QUIET_DAYS = 14

export const thisMonthKey = () => today().slice(0, 7)

const DAY = 24 * 60 * 60 * 1000
export const daysSince = (iso) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY)) : null)

export function agoLabel(iso) {
  const days = daysSince(iso)
  if (days === null) return ''
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

// 'grow' once the build is finished or a Grow month has been added
// (maintenance clients can start straight on Grow), otherwise 'building'.
export function phase(client) {
  return currentStage(client).key === 'grow' || Object.keys(client.months ?? {}).length ? 'grow' : 'building'
}

// This calendar month's Grow checklist, or null if it hasn't been added yet.
export function thisMonth(client) {
  const keys = Object.keys(client.months ?? {}).sort()
  const key = thisMonthKey()
  if (!client.months?.[key]) return null
  const quarterly = (keys.indexOf(key) + 1) % 3 === 0
  const items = [...monthlyItems(), ...(quarterly ? quarterlyItems() : [])]
  return { key, ...countDone(items, client.months[key].done) }
}

export function docStatuses(client) {
  return Object.keys(DOCS).map((key) => {
    const status = docState(client, key).status || 'draft'
    return { key, name: DOCS[key].name, status, label: statusLabel(key, status) }
  })
}

// Plain-English reasons a client needs Lino's attention. Empty when all is well.
export function attention(client) {
  const reasons = []
  if (phase(client) === 'grow') {
    const month = thisMonth(client)
    if (!month) reasons.push("This month's Grow work isn't added yet")
    else if (month.done === 0) reasons.push("This month's Grow work hasn't started")
  }
  const quiet = daysSince(client.updatedAt)
  if (quiet >= QUIET_DAYS) reasons.push(`No updates for ${quiet} days`)
  for (const doc of docStatuses(client)) {
    if (doc.status === 'sent') reasons.push(`${doc.name} sent, waiting for the client`)
  }
  return reasons
}

export function summary(client) {
  const stage = currentStage(client)
  return {
    stage,
    phase: phase(client),
    progress: percent(overallProgress(client)),
    month: thisMonth(client),
    docs: docStatuses(client),
    attention: attention(client),
  }
}

// ---------- work log ----------

export const newEntryId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const logChanges = (entryId, date, text) => [
  { path: ['worklog', entryId, 'date'], value: date },
  { path: ['worklog', entryId, 'text'], value: text },
]

export const deleteLogChange = (entryId) => [{ path: ['worklog', entryId], value: null }]

// Every entry from the given clients, newest first.
export function logEntries(clients) {
  return clients
    .flatMap((c) =>
      Object.entries(c.worklog ?? {})
        .filter(([, e]) => e?.text)
        .map(([id, e]) => ({ id, date: e.date || '', text: e.text, client: c })),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}
