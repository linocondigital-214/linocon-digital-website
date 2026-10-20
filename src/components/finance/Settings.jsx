import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { centsToText, fetchSettings, saveSettings, toCents } from '../../lib/finance'

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'

// Signed amounts for the starting balance: "-120.50" is an overdrawn account.
const signedCents = (text) => {
  const t = String(text ?? '').trim()
  const neg = t.startsWith('-')
  const v = toCents(neg ? t.slice(1) : t || '0')
  return v === null ? null : neg ? -v : v
}
const signedText = (cents) => (cents < 0 ? `-${centsToText(-cents)}` : centsToText(cents))

// /finance/settings: the starting bank balance, GST registration and the
// typed values on today's balance sheet. Same settings as the Financial Log.
export default function Settings({ onChanged }) {
  const [state, setState] = useState({ status: 'loading' })
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
      .then((d) => {
        const s = d.settings
        setState({ status: 'ready', canSettings: d.canSettings })
        setForm({
          ownerName: s.ownerName,
          openingDate: s.openingDate ?? '',
          openingCash: signedText(s.openingCash),
          gstRegistered: s.gstRegistered,
          gstRegisteredOn: s.gstRegisteredOn ?? '',
          gstFiling: s.gstFiling,
          gstNumber: s.gstNumber ?? '',
          equipment: centsToText(s.equipment),
          otherOwed: centsToText(s.otherOwed),
        })
      })
      .catch(() => setState({ status: 'error' }))
  }, [])

  if (state.status === 'loading') return <p className="text-fin-muted">Loading settings...</p>
  if (state.status === 'error') return <p className="text-fin-muted">Couldn't load your settings. Please refresh the page.</p>

  const set = (key) => (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    const openingCash = signedCents(form.openingCash)
    const equipment = form.equipment.trim() ? toCents(form.equipment) : 0
    const otherOwed = form.otherOwed.trim() ? toCents(form.otherOwed) : 0
    if (openingCash === null || equipment === null || otherOwed === null) return setError('Type amounts like 1250.00.')
    setSaving(true)
    try {
      await saveSettings({ ...form, openingCash, equipment, otherOwed, openingDate: form.openingDate || null })
      setSaved(true)
      onChanged()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <form onSubmit={save} className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Set up once</p>
      <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">Settings</h1>

      <fieldset disabled={!state.canSettings || saving} className="mt-6 flex flex-col gap-4">
        <Section title="Starting bank balance" text="The money in your business account on the day you start using these books. Cash in bank counts from here.">
          <div className="grid grid-cols-2 gap-4">
            <Label text="On this date">
              <input type="date" value={form.openingDate} onChange={set('openingDate')} className={field} />
            </Label>
            <Label text="Balance">
              <Money value={form.openingCash} onChange={set('openingCash')} />
            </Label>
          </div>
        </Section>

        <Section
          title="GST"
          text="Until you register, invoices don’t charge GST and the app watches the $30,000 limit for you. Once registered, GST is added to invoices and claimed back on expenses from the registration date."
        >
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={form.gstRegistered} onChange={set('gstRegistered')} className="w-5 h-5 accent-[#4e6cf5]" />
            I’m registered for GST
          </label>
          {form.gstRegistered && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Label text="Registered from">
                <input type="date" value={form.gstRegisteredOn} onChange={set('gstRegisteredOn')} className={field} />
              </Label>
              <Label text="Filing">
                <select value={form.gstFiling} onChange={set('gstFiling')} className={field}>
                  <option>Annual</option>
                  <option>Quarterly</option>
                </select>
              </Label>
              <Label text="GST number" hint="Shown on invoices sent with Stripe.">
                <input value={form.gstNumber} onChange={set('gstNumber')} placeholder="123456789 RT0001" autoComplete="off" className={field} />
              </Label>
            </div>
          )}
        </Section>

        <Section title="For your balance sheet" text="Things the app can’t see. Leave them at 0 if they don’t apply.">
          <div className="grid grid-cols-2 gap-4">
            <Label text="Equipment you own" hint="Like a laptop bought for the business.">
              <Money value={form.equipment} onChange={set('equipment')} />
            </Label>
            <Label text="Other money owed" hint="Anything else the business owes.">
              <Money value={form.otherOwed} onChange={set('otherOwed')} />
            </Label>
          </div>
        </Section>

        <Section title="Your name" text="Used in the greeting on your dashboard.">
          <input value={form.ownerName} onChange={set('ownerName')} className={field} />
        </Section>
      </fieldset>

      {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}
      {state.canSettings ? (
        <button type="submit" disabled={saving} className="mt-6 w-full h-12 rounded-full fin-grad text-white font-bold disabled:opacity-60">
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save settings'}
        </button>
      ) : (
        <div className="mt-6 text-sm text-fin-muted">Only the owner can change settings.</div>
      )}
      {state.canSettings && (
        <div className="mt-6 text-sm text-fin-muted">
          Want to give a bookkeeper their own login?{' '}
          <Link to="/finance/access" className="underline hover:text-text">
            Go to Access
          </Link>
        </div>
      )}
    </form>
  )
}

function Section({ title, text, children }) {
  return (
    <section className="rounded-2xl border border-fin-line bg-fin-panel p-5">
      <h2 className="font-display font-bold text-lg">{title}</h2>
      <div className="text-sm text-fin-muted mt-1 mb-4">{text}</div>
      {children}
    </section>
  )
}

function Money({ value, onChange }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
      <input inputMode="decimal" placeholder="0.00" value={value} onChange={onChange} className={`${field} pl-8`} />
    </div>
  )
}

function Label({ text, hint, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {text}
      {children}
      {hint && <span className="text-xs font-normal text-fin-muted">{hint}</span>}
    </label>
  )
}
