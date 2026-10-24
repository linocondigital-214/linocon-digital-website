import { useState } from 'react'
import { Link } from 'react-router-dom'
import { INTAKE, GROW_SETUP, GROW_MONTHLY, GROW_QUARTERLY } from '../../lib/clientChecklist'
import {
  STAGES,
  SERVICES,
  METRICS,
  LOG_FIELDS,
  stageProgress,
  stageStatus,
  currentStage,
  overallProgress,
  percent,
  countDone,
  growMonths,
  nextMonthKey,
  monthlyItems,
  quarterlyItems,
  monthLabel,
  dateLabel,
  today,
} from '../../lib/clientProgress'
import { DOCS, docState, isShared, statusLabel } from '../../lib/clientDocs'
import PaymentCard from './PaymentCard'

// The client's progress across Audit, Plan, Build & Launch and Grow.
// Read-only on the client's private link; with `editable`, Lino ticks items
// and every change goes through `onChange([{ path, value }])`.
export default function ProgressBoard({ client, editable = false, onChange, docBase }) {
  const [selected, setSelected] = useState(() => currentStage(client).key)
  const stage = STAGES.find((s) => s.key === selected)
  const ctx = { client, editable, onChange }

  return (
    <div>
      <Header client={client} />

      <div className="mt-10 flex flex-col gap-6">
        {docBase && <Documents client={client} editable={editable} docBase={docBase} />}
        <PaymentCard {...ctx} />
        <StartingPoint {...ctx} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STAGES.map((s) => (
            <StageCard key={s.key} client={client} stage={s} active={s.key === selected} onSelect={() => setSelected(s.key)} />
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-10">
        {stage.key === 'grow' ? <GrowPanel {...ctx} /> : <StagePanel {...ctx} stage={stage} />}
      </div>
    </div>
  )
}

function Header({ client }) {
  const { details } = client
  const overall = percent(overallProgress(client))
  const now = currentStage(client)
  const services = SERVICES.filter((s) => details.services?.[s.key])

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-8 justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">Project progress</p>
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] mt-3 break-words">{details.name}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-text-secondary">
          {details.website && (
            <a
              href={details.website.startsWith('http') ? details.website : `https://${details.website}`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-text underline decoration-blue underline-offset-4"
            >
              {details.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {details.serviceArea && <span>{details.serviceArea}</span>}
          {details.startDate && <span>Started {dateLabel(details.startDate)}</span>}
        </div>
        {services.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {services.map((s) => (
              <span key={s.key} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-surface">
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <Ring value={overall} />
        <div>
          <p className="text-sm text-text-secondary">Now working on</p>
          <p className="font-display font-bold text-2xl">
            {now.n} {now.name}
          </p>
          <p className="text-sm text-text-secondary mt-1">Audit to launch: {overall}% complete</p>
        </div>
      </div>
    </div>
  )
}

// The proposal and service agreement. The client only sees them once sent.
function Documents({ client, editable, docBase }) {
  const docs = Object.values(DOCS).filter((d) => editable || isShared(client, d.key))
  if (!docs.length) return null

  return (
    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
      {docs.map((d) => {
        const state = docState(client, d.key)
        const status = state.status || 'draft'
        const when = status === 'signed' ? state.signedAt : status === 'sent' ? state.sentAt : null
        return (
          <Link
            key={d.key}
            to={`${docBase}/${d.key}`}
            className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4 hover:border-text-tertiary"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-text-secondary">
              <path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-bold">{d.name}</p>
              <p className="text-sm text-text-secondary">
                {!editable && status === 'sent' ? (d.signatures ? 'Ready for you to sign' : 'Ready for you to accept') : statusLabel(d.key, status)}
                {when && !(!editable && status === 'sent') && ` ${dateLabel(when)}`}
                {editable && status === 'draft' && ' · only you can see it'}
              </p>
            </div>
            <span className="text-sm font-semibold text-text-secondary">{editable ? 'Open' : 'View'} &rarr;</span>
          </Link>
        )
      })}
    </div>
  )
}

const HAS_OPTIONS = [
  { value: 'yes', label: 'Have' },
  { value: 'no', label: "Don't have" },
  { value: 'unsure', label: 'Not sure' },
]

// "What the client has": the starting point before the Audit.
function StartingPoint({ client, editable, onChange }) {
  const has = client.has ?? {}
  const items = INTAKE.flatMap((g) => g.items)
  const answered = items.filter((i) => has[i.id])
  const inPlace = items.filter((i) => has[i.id] === 'yes').length
  const needed = items.filter((i) => has[i.id] === 'no').length
  const [open, setOpen] = useState(editable && answered.length === 0)
  if (!editable && answered.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center gap-4 p-5 md:p-6 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-secondary">Starting point</p>
          <h2 className="font-bold text-lg md:text-xl">What you already have</h2>
        </div>
        <span className="text-sm text-text-secondary text-right">
          <b className="text-text">{inPlace}</b> in place
          {needed > 0 && (
            <>
              {' · '}
              <b className="text-text">{needed}</b> to set up
            </>
          )}
        </span>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-border p-5 md:p-6 grid md:grid-cols-2 gap-x-10 gap-y-8">
          {editable && (
            <p className="md:col-span-2 text-sm text-text-secondary -mb-2">
              The client can see this list. Never type passwords here: note who holds each login instead.
            </p>
          )}
          {INTAKE.map((g) => (
            <div key={g.id}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">{g.title}</h3>
              <ul className="flex flex-col gap-3">
                {g.items
                  .filter((i) => editable || has[i.id])
                  .map((i) => (
                    <HasItem key={i.id} item={i} has={has} editable={editable} onChange={onChange} />
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function HasItem({ item, has, editable, onChange }) {
  const value = has[item.id]
  const note = has[`${item.id}.note`]
  const option = HAS_OPTIONS.find((o) => o.value === value)

  if (!editable) {
    return (
      <li className="flex items-start justify-between gap-3">
        <span>
          {item.text}
          {note && <span className="block text-sm text-text-secondary">{note}</span>}
        </span>
        <HasBadge value={value} label={option?.label} />
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-2">
      <span>{item.text}</span>
      <div className="flex flex-wrap items-center gap-2">
        {HAS_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange([{ path: ['has', item.id], value: value === o.value ? null : o.value }])}
            className={`h-9 px-3 rounded-full text-xs font-bold border ${
              value === o.value ? (o.value === 'yes' ? 'bg-gradient-brand text-ink border-transparent' : 'bg-text text-ink border-transparent') : 'border-border text-text-secondary hover:border-text-tertiary'
            }`}
          >
            {o.label}
          </button>
        ))}
        <NoteInput value={note ?? ''} placeholder={item.hint} label={`Note for ${item.text}`} onSave={(v) => onChange([{ path: ['has', `${item.id}.note`], value: v || null }])} />
      </div>
    </li>
  )
}

function HasBadge({ value, label }) {
  const style = value === 'yes' ? 'bg-gradient-brand text-ink' : value === 'no' ? 'bg-orange/15 text-orange' : 'bg-border/60 text-text-secondary'
  return <span className={`shrink-0 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${style}`}>{label}</span>
}

function NoteInput({ value, placeholder, label, onSave }) {
  const [draft, setDraft] = useState(value)
  return (
    <input
      type="text"
      placeholder={placeholder || 'Notes'}
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onSave(draft.trim())}
      className="flex-1 min-w-[140px] h-9 rounded-lg bg-ink border border-border px-3 text-sm outline-none focus:border-blue"
    />
  )
}

function Ring({ value }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E6BFF" />
            <stop offset="100%" stopColor="#FF6A3D" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl">{value}%</span>
    </div>
  )
}

function Bar({ value }) {
  return (
    <div className="h-1.5 rounded-full bg-border overflow-hidden">
      <div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  )
}

const STATUS_TEXT = { done: 'Complete', active: 'In progress', todo: 'Up next' }

function StageCard({ client, stage, active, onSelect }) {
  const status = stageStatus(client, stage)
  const p = stageProgress(client, stage)
  const months = growMonths(client).length
  const detail =
    stage.key === 'grow'
      ? months
        ? `${months} month${months === 1 ? '' : 's'} of growth`
        : 'Starts after launch'
      : client.signoff?.[stage.key]
        ? `Signed off ${dateLabel(client.signoff[stage.key])}`
        : `${p.done} of ${p.total} tasks`

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`text-left rounded-2xl border p-4 md:p-5 transition-colors ${
        active ? 'border-blue bg-surface-2' : 'border-border bg-surface hover:border-text-tertiary'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-bold text-text-secondary">{stage.n}</span>
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
            status === 'done' ? 'bg-gradient-brand text-ink' : status === 'active' ? 'bg-blue/20 text-text' : 'bg-border/60 text-text-secondary'
          }`}
        >
          {stage.key === 'grow' && status === 'active' ? 'Ongoing' : STATUS_TEXT[status]}
        </span>
      </div>
      <p className="font-display font-bold text-lg md:text-xl mt-3 leading-tight">{stage.name}</p>
      <p className="text-xs md:text-sm text-text-secondary mt-1 mb-4">{detail}</p>
      <Bar value={stage.key === 'grow' && months ? 100 : percent(p)} />
    </button>
  )
}

function StagePanel({ client, editable, onChange, stage }) {
  const upNext = stage.sections
    .flatMap((s) => s.items)
    .filter((i) => !client.done?.[i.id] && !client.na?.[i.id])
    .slice(0, 3)

  return (
    <div>
      <PanelHeading stage={stage} />

      {upNext.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 mb-6">
          <p className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Up next</p>
          <ol className="flex flex-col gap-2">
            {upNext.map((i, n) => (
              <li key={i.id} className="flex gap-3">
                <span className="font-display font-bold text-gradient">{n + 1}</span>
                <span>{i.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {stage.sections.map((s) => (
          <Section key={s.id} section={s} client={client} editable={editable} onChange={onChange} />
        ))}
      </div>

      <SignOff stage={stage} client={client} editable={editable} onChange={onChange} />
    </div>
  )
}

function PanelHeading({ stage }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-text-secondary">
        Stage {stage.n} · {stage.verb}
      </p>
      <h2 className="font-display font-bold text-3xl md:text-4xl mt-1">{stage.name}</h2>
      <p className="text-text-secondary mt-2 max-w-2xl">{stage.line}</p>
    </div>
  )
}

function Section({ section, client, editable, onChange, doneMap = client.done, donePath = ['done'], defaultOpen }) {
  const count = countDone(section.items, doneMap, client.na)
  const complete = count.total > 0 && count.done === count.total
  const [open, setOpen] = useState(defaultOpen ?? !complete)

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg md:text-xl">{section.title}</h3>
          {section.sub && <p className="text-sm text-text-secondary mt-1">{section.sub}</p>}
        </div>
        <span className={`text-sm font-bold whitespace-nowrap ${complete ? 'text-gradient' : 'text-text-secondary'}`}>
          {complete ? 'All done' : `${count.done} / ${count.total}`}
        </span>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="border-t border-border divide-y divide-border">
          {section.items.map((item) => (
            <Item key={item.id} item={item} client={client} editable={editable} onChange={onChange} doneMap={doneMap} donePath={donePath} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Item({ item, client, editable, onChange, doneMap, donePath }) {
  const done = doneMap?.[item.id]
  const na = client.na?.[item.id]
  const toggle = () => onChange([{ path: [...donePath, item.id], value: done ? null : donePath.length === 1 ? today() : true }])

  const box = (
    <span
      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 ${
        done ? 'bg-gradient-brand border-transparent' : 'border-text-tertiary'
      }`}
    >
      {done && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="#0b0b10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
  const label = (
    <span className={`flex-1 ${na ? 'line-through text-text-tertiary' : done ? '' : 'text-text-secondary'}`}>{item.text}</span>
  )
  const meta = na ? (
    <span className="text-xs font-bold text-text-tertiary">N/A</span>
  ) : typeof done === 'string' ? (
    <span className="text-xs text-text-secondary whitespace-nowrap">{dateLabel(done)}</span>
  ) : null

  if (!editable) {
    return (
      <li className="flex items-start gap-3 px-5 md:px-6 py-3.5">
        {box}
        {label}
        {meta}
      </li>
    )
  }

  return (
    <li className="flex items-start gap-1 pr-3 md:pr-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={Boolean(done)}
        disabled={na}
        onClick={toggle}
        className="flex-1 flex items-start gap-3 text-left pl-5 md:pl-6 py-3.5 hover:bg-surface-2 disabled:cursor-default"
      >
        {box}
        {label}
        {meta}
      </button>
      {donePath.length === 1 && (
        <button
          type="button"
          onClick={() => onChange([{ path: ['na', item.id], value: na ? null : true }])}
          className="text-xs font-semibold text-text-tertiary hover:text-text px-2 py-4"
          title="Mark as not applying to this client"
        >
          {na ? 'Undo N/A' : 'N/A'}
        </button>
      )}
    </li>
  )
}

function SignOff({ stage, client, editable, onChange }) {
  const date = client.signoff?.[stage.key]
  const set = (value) => onChange([{ path: ['signoff', stage.key], value }])

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <p className="font-bold">{stage.name} sign-off</p>
        <p className="text-sm text-text-secondary mt-1">
          {date ? `Approved by the client on ${dateLabel(date)}.` : 'The client approves this stage before the next one starts.'}
        </p>
      </div>
      {editable && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date || ''}
            onChange={(e) => set(e.target.value || null)}
            className="h-11 rounded-xl bg-surface border border-border px-3 text-sm [color-scheme:dark]"
            aria-label={`${stage.name} sign-off date`}
          />
          {!date && (
            <button type="button" onClick={() => set(today())} className="h-11 px-4 rounded-full bg-gradient-brand text-ink text-sm font-bold">
              Signed off today
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function GrowPanel({ client, editable, onChange }) {
  const stage = STAGES[3]
  const months = growMonths(client).reverse()
  const setup = { id: 'grow.setup', title: 'Grow setup', sub: 'Once, right after launch. Set the baseline so progress is visible.', items: GROW_SETUP }
  const next = nextMonthKey(client)

  return (
    <div>
      <PanelHeading stage={stage} />
      <div className="flex flex-col gap-4">
        <Section section={setup} client={client} editable={editable} onChange={onChange} />
        <Numbers client={client} editable={editable} onChange={onChange} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 mt-12 mb-5">
        <div>
          <h3 className="font-display font-bold text-2xl md:text-3xl">Month by month</h3>
          <p className="text-text-secondary mt-1">Measure, find out why, make the highest-value fix, repeat.</p>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => onChange([{ path: ['months', next, 'added'], value: today() }])}
            className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold"
          >
            Add {monthLabel(next)}
          </button>
        )}
      </div>

      {months.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-text-secondary">
          Monthly growth work starts after launch. Each month will show up here with what we measured, what we improved and
          what comes next.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {months.map((m, i) => (
            <Month key={m.key} month={m} client={client} editable={editable} onChange={onChange} startOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}

function Numbers({ client, editable, onChange }) {
  const numbers = client.numbers ?? {}
  const hasAny = METRICS.some((m) => numbers.baseline?.[m.key] != null || numbers.now?.[m.key] != null)
  if (!editable && !hasAny) return null

  const cell = (row, metric) => {
    const value = numbers[row]?.[metric.key]
    if (!editable) return value != null ? value.toLocaleString('en-CA') : '—'
    return (
      <NumberInput
        value={value}
        label={`${metric.name}, ${row === 'baseline' ? 'at Audit' : 'now'}`}
        onSave={(v) => onChange([{ path: ['numbers', row, metric.key], value: v }])}
      />
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <h3 className="font-bold text-lg md:text-xl">Baseline vs today</h3>
      <p className="text-sm text-text-secondary mt-1 mb-4">Real numbers from Google Analytics, Search Console and your records.</p>
      <div className="overflow-x-auto -mx-5 md:mx-0">
        <table className="w-full min-w-[480px] text-sm mx-5 md:mx-0">
          <thead>
            <tr className="text-left text-text-secondary">
              <th className="font-semibold py-2 pr-4">Measure</th>
              <th className="font-semibold py-2 pr-4">At Audit</th>
              <th className="font-semibold py-2 pr-4">Now</th>
              <th className="font-semibold py-2">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {METRICS.map((m) => {
              const a = numbers.baseline?.[m.key]
              const b = numbers.now?.[m.key]
              const diff = a != null && b != null ? b - a : null
              return (
                <tr key={m.key}>
                  <td className="py-2.5 pr-4">{m.name}</td>
                  <td className="py-2.5 pr-4">{cell('baseline', m)}</td>
                  <td className="py-2.5 pr-4">{cell('now', m)}</td>
                  <td className={`py-2.5 font-bold ${diff > 0 ? 'text-gradient' : 'text-text-secondary'}`}>
                    {diff == null ? '—' : `${diff > 0 ? '+' : ''}${diff.toLocaleString('en-CA')}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NumberInput({ value, label, onSave }) {
  const [draft, setDraft] = useState(value ?? '')
  const save = () => {
    const next = draft === '' ? null : Number(draft)
    if (next !== (value ?? null) && (next === null || Number.isFinite(next))) onSave(next)
  }
  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      className="w-28 h-10 rounded-lg bg-ink border border-border px-3 outline-none focus:border-blue"
    />
  )
}

function Month({ month, client, editable, onChange, startOpen }) {
  const [open, setOpen] = useState(startOpen)
  const items = [...monthlyItems(), ...(month.quarterly ? quarterlyItems() : [])]
  const count = countDone(items, month.done)
  const log = month.log ?? {}
  const donePath = ['months', month.key, 'done']

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center gap-4 p-5 md:p-6 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-secondary">
            Month {month.number}
            {month.quarterly && ' · Quarterly review'}
          </p>
          <h4 className="font-display font-bold text-xl md:text-2xl">{monthLabel(month.key)}</h4>
        </div>
        <div className="w-24 md:w-40 shrink-0">
          <p className="text-sm font-bold text-right mb-2">
            {count.done} / {count.total}
          </p>
          <Bar value={percent(count)} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-5 md:p-6 flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {LOG_FIELDS.map((f) =>
              editable ? (
                <TextArea
                  key={f.key}
                  label={f.name}
                  value={log[f.key] ?? ''}
                  onSave={(v) => onChange([{ path: ['months', month.key, 'log', f.key], value: v || null }])}
                />
              ) : (
                log[f.key] && (
                  <div key={f.key} className="rounded-xl bg-ink/60 border border-border p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{f.name}</p>
                    <p className="mt-2 whitespace-pre-line">{log[f.key]}</p>
                  </div>
                )
              ),
            )}
          </div>

          <div className="flex flex-col gap-3">
            {GROW_MONTHLY.map((g) => (
              <Section key={g.id} section={g} client={client} editable={editable} onChange={onChange} doneMap={month.done} donePath={donePath} defaultOpen={false} />
            ))}
            {month.quarterly &&
              GROW_QUARTERLY.map((g) => (
                <Section
                  key={g.id}
                  section={{ ...g, title: `Quarterly: ${g.title}` }}
                  client={client}
                  editable={editable}
                  onChange={onChange}
                  doneMap={month.done}
                  donePath={donePath}
                  defaultOpen={false}
                />
              ))}
          </div>

          {editable && (
            <button
              type="button"
              onClick={() => window.confirm(`Remove ${monthLabel(month.key)} and everything ticked in it?`) && onChange([{ path: ['months', month.key], value: null }])}
              className="self-start text-sm font-semibold text-text-tertiary hover:text-orange"
            >
              Remove this month
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TextArea({ label, value, onSave }) {
  const [draft, setDraft] = useState(value)
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{label}</span>
      <textarea
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onSave(draft.trim())}
        className="rounded-xl bg-ink border border-border px-4 py-3 outline-none focus:border-blue resize-y"
      />
    </label>
  )
}
