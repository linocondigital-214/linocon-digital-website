import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PrivateShell, { SetupNotice, Notice } from '../components/progress/PrivateShell'
import AdminLogin from '../components/progress/AdminLogin'
import CopyLinkButton from '../components/progress/CopyLinkButton'
import {
  SERVICES,
  createClient,
  currentStage,
  fetchClients,
  overallProgress,
  percent,
  rememberPassword,
  savedPassword,
} from '../lib/clientProgress'
import usePageMeta from '../lib/usePageMeta'

// /clients: Lino's list of clients, and where new clients are added.
export default function Clients() {
  usePageMeta('Clients')
  const [password, setPassword] = useState(savedPassword)
  const [state, setState] = useState({ status: password ? 'loading' : 'login' })

  const load = useCallback((pw) => {
    fetchClients(pw)
      .then((clients) => {
        rememberPassword(pw)
        setState({ status: 'ready', clients })
      })
      .catch((err) => {
        if (err.status === 401) {
          rememberPassword('')
          setState({ status: 'login', wrong: true })
        } else setState({ status: err.code === 'setup' ? 'setup' : 'error' })
      })
  }, [])

  useEffect(() => {
    if (password) load(password)
  }, [password, load])

  const signOut = () => {
    rememberPassword('')
    setPassword('')
    setState({ status: 'login' })
  }

  return (
    <PrivateShell
      actions={
        state.status === 'ready' && (
          <button type="button" onClick={signOut} className="text-sm font-semibold text-text-secondary hover:text-text">
            Sign out
          </button>
        )
      }
    >
      {state.status === 'login' && (
        <AdminLogin
          wrong={state.wrong}
          onSubmit={(pw) => {
            setState({ status: 'loading' })
            setPassword(pw)
            load(pw)
          }}
        />
      )}
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
          password={password}
          onAdded={(client) => setState({ status: 'ready', clients: [client, ...state.clients] })}
        />
      )}
    </PrivateShell>
  )
}

function ClientList({ clients, password, onAdded }) {
  const [adding, setAdding] = useState(clients.length === 0)

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
        <AddClient
          password={password}
          onCancel={clients.length ? () => setAdding(false) : null}
          onAdded={(c) => {
            setAdding(false)
            onAdded(c)
          }}
        />
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {clients.map((c) => {
          const stage = currentStage(c)
          const p = percent(overallProgress(c))
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-surface p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-2xl break-words">{c.details.name}</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Now: {stage.n} {stage.name} · {p}% to launch
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-gradient-brand" style={{ width: `${p}%` }} />
              </div>
              <div className="flex flex-wrap gap-3">
                {/* `!` because the site-wide `a { color: inherit }` rule in index.css
                    sits outside Tailwind's layers and would otherwise win. */}
                <Link to={`/clients/${c.id}`} className="h-11 px-5 rounded-full bg-text text-ink! text-sm font-bold flex items-center">
                  Update progress
                </Link>
                <CopyLinkButton id={c.id} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AddClient({ password, onAdded, onCancel }) {
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
      onAdded(await createClient(password, details))
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
