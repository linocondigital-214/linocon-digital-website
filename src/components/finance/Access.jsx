import { useEffect, useState } from 'react'
import { fetchAccess, inviteBookkeeper, removeBookkeeper, shortDate } from '../../lib/finance'

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'
const day = (iso) => shortDate(iso.slice(0, 10))

const CAN = ['See everything in your books', 'Add expenses, income and owner & tax money', 'Start invoices as drafts', 'Download the exports for your accountant']
const CANNOT = ['Change or delete anything', 'Send or void invoices', 'Change settings or who has access']

// /finance/access: the owner invites one bookkeeper with a one-time code, and
// can remove them at any time (they're signed out at once).
export default function Access() {
  const [state, setState] = useState({ status: 'loading' })
  const [name, setName] = useState('')
  const [issued, setIssued] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAccess()
      .then((d) => setState({ status: 'ready', ...d }))
      .catch((err) => setState({ status: err.status === 403 ? 'denied' : 'error' }))
  }, [])

  if (state.status === 'loading') return <p className="text-fin-muted">Loading...</p>
  if (state.status === 'denied') return <p className="text-fin-muted">Only the owner can change who has access.</p>
  if (state.status === 'error') return <p className="text-fin-muted">Couldn't load this page. Please refresh.</p>

  async function run(work) {
    setBusy(true)
    setError('')
    try {
      await work()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  const invite = (who) =>
    run(async () => {
      const res = await inviteBookkeeper(who)
      setIssued(res)
      setCopied(false)
      setState((s) => ({ ...s, invite: { name: res.name, expires: res.expires } }))
    })

  const remove = () =>
    run(async () => {
      const d = await removeBookkeeper()
      setState({ status: 'ready', ...d })
      setIssued(null)
      setConfirm(false)
      setName('')
    })

  const { bookkeeper, invite: pending } = state
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Who can sign in</p>
      <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">Access</h1>

      <section className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display font-bold text-lg">You, the owner</div>
            <div className="text-sm text-fin-muted">Full access. Password and authenticator code.</div>
          </div>
          <span className="text-xs font-semibold rounded-full px-3 py-1 bg-fin-good/15 text-fin-good">Owner</span>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-fin-line bg-fin-panel p-5">
        <div className="font-display font-bold text-lg">Bookkeeper</div>

        {bookkeeper ? (
          <>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{bookkeeper.name}</div>
                <div className="text-sm text-fin-muted">
                  Joined {day(bookkeeper.linkedAt)} · last signed in {day(bookkeeper.lastSignIn)}
                </div>
              </div>
              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-fin-blue/15 text-fin-blue">Bookkeeper</span>
            </div>
            {!confirm ? (
              <button type="button" onClick={() => setConfirm(true)} className="mt-5 h-11 px-5 rounded-full border border-fin-line text-sm font-semibold hover:text-fin-bad">
                Remove access
              </button>
            ) : (
              <Confirm busy={busy} onCancel={() => setConfirm(false)} onConfirm={remove} text={`${bookkeeper.name} will be signed out right away and can’t sign in again.`} />
            )}
          </>
        ) : issued ? (
          <div className="mt-3">
            <div className="text-sm text-fin-muted">Give this code to {issued.name} by phone or in person. It is shown only once.</div>
            <div className="mt-3 rounded-xl bg-fin-panel-2 border border-fin-line py-4 text-center font-mono text-2xl tracking-[0.15em]">{issued.code}</div>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(issued.code).then(() => setCopied(true))}
              className="mt-3 h-10 px-4 rounded-full border border-fin-line text-sm font-semibold hover:bg-fin-panel-2"
            >
              {copied ? 'Copied' : 'Copy code'}
            </button>
            <ol className="mt-5 flex flex-col gap-2 text-sm text-fin-muted list-decimal pl-5">
              <li>They open linocondigital.com/finance and tap “Bookkeeper with an invite code?”</li>
              <li>They type this code and choose their own password.</li>
              <li>They link their own authenticator app, just like you did.</li>
            </ol>
            <div className="mt-4 text-sm text-fin-muted">The code works once and stops working on {day(issued.expires)}.</div>
          </div>
        ) : pending ? (
          <div className="mt-3">
            <div className="text-sm text-fin-muted">
              Waiting for {pending.name} to use their invite code. It stops working on {day(pending.expires)}.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => invite(pending.name)} className="h-11 px-5 rounded-full border border-fin-line text-sm font-semibold hover:bg-fin-panel-2">
                Make a new code
              </button>
              <button type="button" disabled={busy} onClick={remove} className="h-11 px-5 rounded-full text-sm text-fin-muted hover:text-fin-bad">
                Cancel the invite
              </button>
            </div>
          </div>
        ) : (
          <form
            className="mt-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) invite(name.trim())
            }}
          >
            <div className="text-sm text-fin-muted">Give a bookkeeper their own login with limited rights. You can remove it at any time.</div>
            <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
              Bookkeeper’s name
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Like Maria Chen" className={field} />
            </label>
            <button type="submit" disabled={busy || !name.trim()} className="mt-4 w-full h-12 rounded-full fin-grad text-white font-bold disabled:opacity-60">
              {busy ? 'Creating...' : 'Create an invite code'}
            </button>
          </form>
        )}
        {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}
      </section>

      <section className="mt-4 grid sm:grid-cols-2 gap-4">
        <List title="A bookkeeper can" items={CAN} good />
        <List title="A bookkeeper can’t" items={CANNOT} />
      </section>
    </div>
  )
}

function Confirm({ text, onCancel, onConfirm, busy }) {
  return (
    <div className="mt-5 rounded-xl border border-fin-line bg-fin-panel-2/60 p-4">
      <div className="text-sm">{text}</div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onCancel} className="h-10 px-4 rounded-full border border-fin-line text-sm">
          Keep access
        </button>
        <button type="button" disabled={busy} onClick={onConfirm} className="h-10 px-4 rounded-full bg-fin-bad text-white text-sm font-semibold disabled:opacity-60">
          Remove access
        </button>
      </div>
    </div>
  )
}

function List({ title, items, good }) {
  return (
    <div className="rounded-2xl border border-fin-line bg-fin-panel p-5">
      <div className="font-semibold">{title}</div>
      <ul className="mt-3 flex flex-col gap-2 text-sm text-fin-muted">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className={good ? 'text-fin-good' : 'text-fin-bad'}>{good ? '✓' : '✕'}</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  )
}
