import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WAITING_TEXT, addDays, clientSchedule, dueDay, workStart } from '../../../api/_lib/schedule.js'
import { dateLabel, fetchCalendarLink, monthLabel, today } from '../../lib/clientProgress'
import { workReminders } from '../../lib/workSchedule'

const STATE = {
  done: ['Done', 'border-blue text-blue'],
  late: ['Overdue', 'border-orange text-orange'],
  today: ['Due today', 'border-orange text-orange'],
  week: ['This week', 'border-orange/60 text-orange'],
  later: ['Coming up', 'border-border text-text-tertiary'],
}

const shortDay = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })

// /admin: every client's work that's due, from their schedule. Work starts
// once the service agreement is signed and the deposit is paid; then each
// monthly client has that month's Grow work due on the same day every month.
export function ScheduleSection({ clients, paidOn, onChange }) {
  const [showDone, setShowDone] = useState(false)
  const rows = workReminders(clients, paidOn)
  const open = rows.filter((r) => !r.done)
  const shown = showDone ? rows : open
  const due = open.filter((r) => r.state !== 'later').length
  const waiting = clients
    .map((c) => ({ client: c, when: workStart(c, c.paidOn ?? paidOn?.[c.id]) }))
    .filter((w) => w.when.waiting === 'deposit')

  return (
    <section className="mb-10 rounded-2xl border border-border bg-surface p-5 md:p-6" aria-labelledby="schedule-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="schedule-heading" className="font-display font-bold text-2xl">
          Schedule of work
        </h2>
        <span className={`text-sm font-semibold ${due ? 'text-orange' : 'text-text-secondary'}`}>
          {due ? `${due} due this week or overdue` : 'Nothing due this week'}
        </span>
      </div>

      {rows.length === 0 && waiting.length === 0 ? (
        <div className="text-text-secondary pt-2">
          A client's schedule starts once their service agreement is signed and their deposit is paid. Their monthly work then
          shows up here every month.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {waiting.map(({ client }) => (
            <li key={`wait-${client.id}`} className="rounded-xl border border-border bg-ink/40 px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="flex-1 min-w-[12rem]">
                <span className="font-bold">{client.details.name}</span>
                <span className="block text-sm text-text-secondary">{WAITING_TEXT.deposit}</span>
              </span>
              <Link to={`/admin/${client.id}#schedule`} className="h-10 px-4 rounded-full border border-border text-sm font-semibold flex items-center">
                Deposit received?
              </Link>
            </li>
          ))}
          {shown.map((r) => (
            <ReminderRow key={`${r.client.id}-${r.item.kind}-${r.item.month}`} row={r} onChange={onChange} />
          ))}
        </ul>
      )}
      {rows.length > open.length && (
        <button type="button" onClick={() => setShowDone((v) => !v)} className="mt-3 text-sm font-semibold text-text-secondary hover:text-text">
          {showDone ? 'Hide finished work' : `Show finished work (${rows.length - open.length})`}
        </button>
      )}
      <CalendarLink />
    </section>
  )
}

function ReminderRow({ row, onChange }) {
  const { client, item, title, state, month } = row
  const [label, tone] = STATE[state]
  const [busy, setBusy] = useState(false)
  const addMonth = async () => {
    setBusy(true)
    try {
      await onChange(client.id, [{ path: ['months', item.month, 'added'], value: today() }])
    } finally {
      setBusy(false)
    }
  }
  return (
    <li className="rounded-xl border border-border bg-ink/40 px-4 py-3 flex flex-wrap items-center gap-3">
      <span className="w-14 shrink-0 text-center">
        <span className="block text-xs uppercase text-text-tertiary">{shortDay(item.date).split(' ')[0]}</span>
        <span className="block font-display font-bold text-xl leading-tight">{Number(item.date.slice(8))}</span>
      </span>
      <span className="flex-1 min-w-[12rem]">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{client.details.name}</span>
          <span className={`text-xs font-bold border rounded-full px-2 py-0.5 ${tone}`}>{label}</span>
        </span>
        <span className="block text-sm text-text-secondary">
          {title}
          {month?.added && !month.done && ` · ${month.total - month.ticked} of ${month.total} left`}
        </span>
      </span>
      {item.kind === 'work' && !month.added ? (
        <button type="button" onClick={addMonth} disabled={busy} className="h-10 px-4 rounded-full bg-gradient-brand text-ink text-sm font-bold disabled:opacity-60">
          {busy ? 'Adding...' : `Add ${monthLabel(item.month).split(' ')[0]} checklist`}
        </button>
      ) : (
        <Link to={`/admin/${client.id}`} className="h-10 px-4 rounded-full border border-border text-sm font-semibold flex items-center">
          Open
        </Link>
      )}
    </li>
  )
}

// The schedule in Lino's phone calendar, with a reminder each morning
// something is due.
function CalendarLink() {
  const [link, setLink] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const get = async (renew) => {
    setError('')
    try {
      setLink((await fetchCalendarLink(renew)).url)
    } catch {
      setError("Couldn't make the link. Try again.")
    }
  }
  if (!link) {
    return (
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => get(false)} className="h-11 px-5 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary">
          Get reminders in my phone calendar
        </button>
        {error && <span className="text-sm text-orange">{error}</span>}
      </div>
    )
  }
  return (
    <div className="mt-5 pt-5 border-t border-border text-sm flex flex-col gap-3">
      <div className="font-bold">Your private calendar link</div>
      <div className="flex gap-2">
        <input readOnly value={link} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 h-11 rounded-xl bg-ink border border-border px-3 text-text" />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
          className="h-11 px-4 rounded-full bg-gradient-brand text-ink font-bold"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <ol className="list-decimal pl-5 text-text-secondary flex flex-col gap-1">
        <li>On a computer, open Google Calendar.</li>
        <li>Next to "Other calendars", click the + sign, then "From URL".</li>
        <li>Paste the link and click "Add calendar". It shows up on your phone too.</li>
      </ol>
      <div className="text-text-secondary">
        Work due and invoices to send show up on the right day. Keep this link private. If it ever gets out,{' '}
        <button type="button" onClick={() => get(true)} className="underline">
          make a new link
        </button>{' '}
        and the old one stops working.
      </div>
    </div>
  )
}

// On a client's admin page: when their schedule starts, the deposit, and
// what's next.
export function ScheduleCard({ client, onChange }) {
  const paidOn = client.paidOn
  const when = workStart(client, paidOn)
  const next = clientSchedule(client, paidOn, addDays(today(), 95)).items.filter((i) => i.date >= today()).slice(0, 6)
  const title = { start: 'Start the work', work: (i) => `Month ${i.n} work due`, invoice: (i) => `Month ${i.n} invoice to send` }
  return (
    <section id="schedule" className="rounded-2xl border border-border bg-surface p-5 md:p-6 mb-10 scroll-mt-24" aria-labelledby="schedule-card-heading">
      <h2 id="schedule-card-heading" className="font-display font-bold text-xl">
        Schedule of work
      </h2>
      <div className="text-sm text-text-secondary pt-1">
        {when.waiting ? WAITING_TEXT[when.waiting] : `Started ${dateLabel(when.start)}. Monthly work and invoices fall on day ${dueDay(when.start)} of each month.`}
      </div>
      {when.waiting !== 'agreement' && (
        <label className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-text-secondary">Deposit received on</span>
          <input
            type="date"
            value={client.schedule?.depositOn || paidOn || ''}
            onChange={(e) => onChange([{ path: ['schedule', 'depositOn'], value: e.target.value || null }])}
            className="h-10 rounded-lg bg-ink border border-border px-3 text-text [color-scheme:dark]"
          />
          {paidOn && !client.schedule?.depositOn && <span className="text-text-tertiary">from the paid invoice in Finance</span>}
        </label>
      )}
      {next.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 text-sm">
          {next.map((i) => (
            <li key={`${i.kind}-${i.month}`} className="flex gap-3">
              <span className="w-16 shrink-0 text-text-tertiary">{shortDay(i.date)}</span>
              <span>{typeof title[i.kind] === 'function' ? title[i.kind](i) : title[i.kind]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
