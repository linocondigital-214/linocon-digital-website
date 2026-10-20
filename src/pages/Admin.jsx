import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PrivateShell, { SetupNotice, Notice } from '../components/progress/PrivateShell'
import { AdminSignIn, AdminSignOut } from '../components/progress/AdminClientGate'
import { LoginChip } from '../components/progress/ClientLogin'
import { WorkLogForm, WorkLogList } from '../components/progress/WorkLog'
import { SERVICES, changeClient, createClient, fetchClients, forgetOldPassword, monthLabel, percent } from '../lib/clientProgress'
import { agoLabel, logEntries, summary, thisMonthKey } from '../lib/clientOverview'
import usePageMeta from '../lib/usePageMeta'

// /admin: Lino's overview of every client (where each one is, what needs
// attention, the work log), and where new clients are added. Only Lino can
// sign in here, with the same password and phone code as /finance.
export default function Admin() {
  usePageMeta('Admin')
  const [state, setState] = useState({ status: 'loading' })

  const load = useCallback(() => {
    forgetOldPassword()
    fetchClients()
      .then(({ clients, logins }) => setState({ status: 'ready', clients, logins }))
      .catch((err) => {
        if (err.status === 401) setState({ status: 'login' })
        else setState({ status: err.code === 'setup' ? 'setup' : 'error' })
      })
  }, [])

  useEffect(load, [load])

  if (state.status === 'login') return <AdminSignIn onSignedIn={load} />

  return (
    <PrivateShell actions={state.status === 'ready' && <AdminSignOut />}>
      {state.status === 'loading' && <p className="text-text-secondary">Loading clients...</p>}
      {state.status === 'setup' && <SetupNotice />}
      {state.status === 'error' && (
        <Notice title="Couldn't load clients">
          <p>Please refresh the page in a moment.</p>
        </Notice>
      )}
      {state.status === 'ready' && (
        <ClientList
          clients={state.clients}
          logins={state.logins}
          onAdded={(client) => setState((s) => ({ ...s, clients: [client, ...s.clients] }))}
          onChanged={(client) =>
            setState((s) => ({ ...s, clients: s.clients.map((c) => (c.id === client.id ? client : c)) }))
          }
          onSignedOut={() => setState({ status: 'login' })}
        />
      )}
    </PrivateShell>
  )
}

function ClientList({ clients, logins, onAdded, onChanged, onSignedOut }) {
  const [adding, setAdding] = useState(clients.length === 0)
  const [filter, setFilter] = useState('all')
  // Clients that need attention come first.
  const rows = clients
    .map((c) => ({ client: c, ...summary(c) }))
    .sort((a, b) => Number(b.attention.length > 0) - Number(a.attention.length > 0))
  const counts = {
    all: rows.length,
    building: rows.filter((r) => r.phase === 'building').length,
    grow: rows.filter((r) => r.phase === 'grow').length,
    attention: rows.filter((r) => r.attention.length).length,
  }
  const shown = rows.filter((r) => (filter === 'all' ? true : filter === 'attention' ? r.attention.length : r.phase === filter))

  // Saves a change to one client from this page (the work log) and swaps in
  // the saved record.
  async function change(id, changes) {
    try {
      onChanged(await changeClient(id, changes))
    } catch (err) {
      if (err.status === 401) onSignedOut()
      throw err
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">Client progress</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl mt-2">Your clients</h1>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="h-12 px-6 rounded-full bg-gradient-brand text-ink font-bold">
            Add a client
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-10">
          <AddClient
            onCancel={clients.length ? () => setAdding(false) : null}
            onAdded={(c) => {
              setAdding(false)
              onAdded(c)
            }}
          />
        </div>
      )}

      {clients.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="tablist" aria-label="Filter clients">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-2xl border p-4 md:p-5 text-left transition-colors ${
                  filter === f.key ? 'border-blue bg-surface-2' : 'border-border bg-surface hover:border-text-tertiary'
                }`}
              >
                <span className={`block font-display font-bold text-3xl md:text-4xl ${f.key === 'attention' && counts.attention ? 'text-orange' : ''}`}>
                  {counts[f.key]}
                </span>
                <span className="block text-sm font-semibold text-text-secondary mt-1">{f.name}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            {shown.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-text-secondary">
                {filter === 'attention' ? 'Nothing needs your attention right now.' : 'No clients here yet.'}
              </p>
            )}
            {shown.map((r) => (
              <ClientRow key={r.client.id} row={r} login={logins?.[r.client.id]} />
            ))}
          </div>

          <section className="mt-16" aria-labelledby="worklog-heading">
            <h2 id="worklog-heading" className="font-display font-bold text-2xl md:text-3xl">
              Work log
            </h2>
            <p className="text-text-secondary mt-1 mb-5">
              Your log book for every client, newest first. Only you see it.
            </p>
            <WorkLogForm clients={clients} onAdd={change} />
            <div className="mt-6">
              <WorkLogList entries={logEntries(clients)} showClient onDelete={change} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

const FILTERS = [
  { key: 'all', name: 'All clients' },
  { key: 'building', name: 'Building' },
  { key: 'grow', name: 'On Grow plan' },
  { key: 'attention', name: 'Need attention' },
]

const DOC_TONE = {
  draft: 'border-border text-text-tertiary',
  sent: 'border-orange text-orange',
  signed: 'border-blue text-blue',
}

function ClientRow({ row, login }) {
  const { client: c, stage, phase, progress, month, docs, attention } = row
  const lastNote = logEntries([c])[0]

  return (
    <article
      className={`rounded-2xl border bg-surface p-5 md:p-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.5fr)_10rem] lg:items-center ${
        attention.length ? 'border-orange/60' : 'border-border'
      }`}
    >
      <div className="min-w-0">
        <h3 className="font-display font-bold text-xl md:text-2xl break-words">{c.details.name}</h3>
        {c.details.website && <p className="text-sm text-text-tertiary break-all">{c.details.website}</p>}
        {attention.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {attention.map((a) => (
              <li key={a} className="text-sm font-semibold text-orange flex gap-2">
                <span aria-hidden="true">&bull;</span>
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          {phase === 'grow' ? 'On Grow plan' : `Now: ${stage.n} ${stage.name}`}
        </p>
        {phase === 'grow' ? (
          <>
            <p className="font-semibold mt-1">
              {month ? `${monthLabel(month.key)}: ${month.done} of ${month.total} done` : `${monthLabel(thisMonthKey())}: not added`}
            </p>
            <Bar value={month ? percent(month) : 0} />
          </>
        ) : (
          <>
            <p className="font-semibold mt-1">{progress}% to launch</p>
            <Bar value={progress} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {docs.map((d) => (
            <span key={d.key} className={`text-xs font-semibold px-3 py-1 rounded-full border ${DOC_TONE[d.status]}`}>
              {d.name}: {d.label}
            </span>
          ))}
        </div>
        <p className="text-sm text-text-secondary">
          Last update {agoLabel(c.updatedAt)}
          {lastNote && <span className="block text-text-tertiary truncate">Last note: {lastNote.text}</span>}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
        {/* `!` because the site-wide `a { color: inherit }` rule in index.css
            sits outside Tailwind's layers and would otherwise win. */}
        <Link to={`/admin/${c.id}`} className="h-11 px-5 rounded-full bg-text text-ink! text-sm font-bold flex items-center justify-center">
          Open
        </Link>
        <LoginChip login={login} />
      </div>
    </article>
  )
}

function Bar({ value }) {
  return (
    <div className="h-1.5 rounded-full bg-border overflow-hidden mt-2">
      <div className="h-full bg-gradient-brand" style={{ width: `${value}%` }} />
    </div>
  )
}

function AddClient({ onAdded, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const details = {
      name: form.name.value,
      website: form.website.value,
      contact: form.contact.value,
      email: form.email.value,
      serviceArea: form.serviceArea.value,
      startDate: form.startDate.value,
      services: Object.fromEntries(SERVICES.map((s) => [s.key, form[`service-${s.key}`].checked])),
    }
    setSaving(true)
    setError('')
    try {
      onAdded(await createClient(details))
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-blue bg-surface p-5 md:p-8">
      <h2 className="font-display font-bold text-2xl mb-6">New client</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Business name" name="name" required />
        <Field label="Website" name="website" placeholder="example.ca" />
        <Field label="Main contact" name="contact" />
        <Field label="Phone / email" name="email" />
        <Field label="Service area" name="serviceArea" placeholder="Vancouver, BC" />
        <Field label="Project start date" name="startDate" type="date" />
      </div>
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-text-secondary mb-3">Services in scope</legend>
        <div className="flex flex-wrap gap-3">
          {SERVICES.map((s) => (
            <label key={s.key} className="flex items-center gap-2 h-11 px-4 rounded-full border border-border cursor-pointer has-[:checked]:border-blue">
              <input type="checkbox" name={`service-${s.key}`} className="accent-[#2e6bff] w-4 h-4" />
              <span className="text-sm font-semibold">{s.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-orange mt-4">{error}</p>}
      <div className="flex gap-3 mt-8">
        <button type="submit" disabled={saving} className="h-12 px-6 rounded-full bg-gradient-brand text-ink font-bold disabled:opacity-60">
          {saving ? 'Adding...' : 'Add client'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-12 px-6 rounded-full border border-border font-semibold">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, name, type = 'text', required, placeholder }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-text-secondary">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue [color-scheme:dark]"
      />
    </label>
  )
}
