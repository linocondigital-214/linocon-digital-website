// Each client's schedule of work and monthly invoices, worked out from what
// is already saved: the signed service agreement, the deposit, and the
// package. Used by /admin (work reminders), /finance (invoice calendar) and
// the calendar feed Lino can add to their phone. No imports, so the pages and
// the API share it.
//
// Work starts once the agreement is signed and the deposit is paid (or on
// signing, when the package has no deposit). From then on, every month on the
// same day of the month, monthly clients have that month's Grow work due and
// an invoice to send.

const DAY = 24 * 60 * 60 * 1000

const iso = (date) => date.toISOString().slice(0, 10)
const parse = (day) => new Date(`${day}T12:00:00Z`)
export const addDays = (day, n) => iso(new Date(parse(day).getTime() + n * DAY))
export const monthKeyOf = (day) => day.slice(0, 7)

function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

const parseList = (json) => {
  try {
    const list = JSON.parse(json || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const hasPackage = (pkg) => Boolean(pkg && (pkg.bundle || pkg.on || pkg.custom))

// Monthly services in the package, or ticked on the client when there's no package.
export function isMonthly(client) {
  const pkg = client.docs?.package
  if (!hasPackage(pkg)) return Boolean(client.details?.services?.grow || client.details?.services?.backlinks)
  if (['grow', 'allin'].includes(pkg.bundle) || pkg.on?.grow || pkg.on?.backlinks) return true
  return parseList(pkg.custom).some((c) => c.billing === 'month' && c.cents > 0)
}

// One-time work with a deposit before it starts.
export function needsDeposit(client) {
  const pkg = client.docs?.package
  if (!hasPackage(pkg)) return Boolean(client.details?.services?.website || client.details?.services?.seo)
  if ((pkg.opt?.deposit ?? '50') === '0') return false
  if (['launch', 'allin'].includes(pkg.bundle) || pkg.on?.website || pkg.on?.seo || Number(pkg.opt?.hours) > 0) return true
  return parseList(pkg.custom).some((c) => c.billing !== 'month' && c.cents > 0)
}

// When work starts, or what it's still waiting for.
//   paidOn: the first paid invoice for this client in /finance, if any.
export function workStart(client, paidOn) {
  const agreement = client.docs?.agreement
  if (agreement?.status !== 'signed') return { waiting: 'agreement' }
  const signed = agreement.signedAt || client.updatedAt?.slice(0, 10)
  const deposit = client.schedule?.depositOn || paidOn || null
  if (needsDeposit(client) && !deposit) return { waiting: 'deposit', signed }
  const start = deposit && deposit > signed ? deposit : signed
  return { start, signed, deposit }
}

// The target launch: the date Lino set, or the start of work plus the
// agreement's "Weeks from start to launch".
export function launchDate(client, start) {
  if (client.schedule?.launchOn) return client.schedule.launchOn
  const weeks = parseInt(client.docs?.agreement?.fields?.launchWeeks, 10)
  return start && weeks > 0 && weeks < 200 ? addDays(start, weeks * 7) : null
}

export const WAITING_TEXT = {
  agreement: 'Starts once the service agreement is signed',
  deposit: 'Agreement signed. Starts once the deposit is paid',
}

// The day of the month things are due: the start day, kept to 28 or earlier
// so every month has it.
export const dueDay = (start) => Math.min(Number(start.slice(8, 10)), 28)

const dueDate = (key, day) => `${key}-${String(day).padStart(2, '0')}`

// Everything due for one client from the start until `until` (YYYY-MM-DD).
// Each item is { kind: 'start' | 'work' | 'invoice', date, month, n }:
//   start    the first day of work (every client)
//   work     that month's Grow work (monthly clients)
//   invoice  that month's invoice (monthly clients)
export function clientSchedule(client, paidOn, until) {
  const when = workStart(client, paidOn)
  if (!when.start) return { ...when, items: [] }
  const items = [{ kind: 'start', date: when.start, month: monthKeyOf(when.start), n: 0 }]
  if (isMonthly(client)) {
    const day = dueDay(when.start)
    const first = monthKeyOf(when.start)
    for (let n = 0; n < 120; n++) {
      const month = addMonths(first, n)
      // The first month's work is due a month after starting, so there's time to do it.
      const workDate = dueDate(addMonths(first, n + 1), day)
      const invoiceDate = n === 0 ? when.start : dueDate(month, day)
      if (invoiceDate > until) break
      items.push({ kind: 'invoice', date: invoiceDate, month, n: n + 1 })
      if (workDate <= until) items.push({ kind: 'work', date: workDate, month, n: n + 1 })
    }
  }
  return { ...when, items: items.sort((a, b) => a.date.localeCompare(b.date)) }
}
