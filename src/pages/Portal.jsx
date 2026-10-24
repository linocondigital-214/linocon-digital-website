import { useCallback, useEffect, useState } from 'react'
import PrivateShell, { Notice } from '../components/progress/PrivateShell'
import ProgressBoard from '../components/progress/ProgressBoard'
import { ClientSteps } from '../components/progress/Journey'
import { fetchMyProgress, portalInvite, portalSignIn, portalSignOut } from '../lib/clientProgress'
import usePageMeta from '../lib/usePageMeta'
import { notifyLino } from '../lib/leads'

// /clients: each client signs in with their own email and password and sees
// only their own progress. Their first sign-in uses the invite code Lino sent
// them (see api/_lib/portal.js).
export default function Portal() {
  const [state, setState] = useState({ status: 'loading' })
  usePageMeta(state.client ? `${state.client.details.name} progress` : 'Client sign-in')

  // joined: they just set up their login with an invite code.
  const load = useCallback((joined) => {
    fetchMyProgress()
      .then((client) => {
        if (joined === true) notifyLino(client, 'set up their client login')
        setState({ status: 'ready', client })
      })
      .catch((err) => {
        if (err.status === 401 || err.status === 404) setState({ status: 'signin' })
        else setState({ status: 'error' })
      })
  }, [])

  useEffect(load, [load])

  async function signOut() {
    await portalSignOut().catch(() => {})
    setState({ status: 'signin' })
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
      {state.status === 'loading' && <p className="text-text-secondary">Loading...</p>}
      {state.status === 'signin' && <SignIn onSignedIn={load} />}
      {state.status === 'error' && (
        <Notice title="Couldn't load your progress">
          <p>Please refresh the page in a moment.</p>
        </Notice>
      )}
      {state.status === 'ready' && (
        <>
          <ClientSteps client={state.client} onClient={(client) => setState({ status: 'ready', client })} />
          <ProgressBoard client={state.client} docBase="/clients" />
        </>
      )}
    </PrivateShell>
  )
}

const field = 'h-12 rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue'
const button = 'h-12 px-6 rounded-full bg-gradient-brand text-ink font-bold disabled:opacity-60'

function SignIn({ onSignedIn }) {
  // The welcome email's button opens /clients#invite=<code> with the code filled in.
  const [invite] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('invite')?.slice(0, 20) ?? '')
  const [mode, setMode] = useState(invite ? 'invite' : 'signin') // 'signin' | 'invite'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const form = e.target
    const email = form.email.value
    const password = form.password.value
    if (mode === 'invite' && password !== form.again.value) return setError("The two passwords don't match.")
    setBusy(true)
    setError('')
    try {
      if (mode === 'invite') await portalInvite(form.code.value, email, password)
      else await portalSignIn(email, password)
      onSignedIn(mode === 'invite')
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
      setBusy(false)
    }
  }

  const switchTo = (next) => {
    setMode(next)
    setError('')
  }

  return (
    <div className="max-w-md mx-auto rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">Client progress</p>
      <h1 className="font-display font-bold text-3xl pt-2">{mode === 'invite' ? 'Set up your login' : 'Sign in'}</h1>
      <div className="text-text-secondary pt-2">
        {mode === 'invite'
          ? 'Type the invite code LinoCon Digital sent you, then choose your email and password.'
          : 'See where your project is, step by step.'}
      </div>
      <form key={mode} onSubmit={submit} className="flex flex-col gap-5 mt-7">
        {mode === 'invite' && (
          <label className="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
            Invite code
            <input
              name="code"
              required
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus={!invite}
              defaultValue={invite}
              placeholder="ABCD-EFGH-JKLM"
              className={`${field} font-mono tracking-wider text-text`}
            />
          </label>
        )}
        <label className="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Email
          <input name="email" type="email" required autoComplete="email" autoFocus={mode === 'signin' || Boolean(invite)} className={`${field} text-text`} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          {mode === 'invite' ? 'Choose a password' : 'Password'}
          <input
            name="password"
            type="password"
            required
            minLength={mode === 'invite' ? 10 : undefined}
            autoComplete={mode === 'invite' ? 'new-password' : 'current-password'}
            className={`${field} text-text`}
          />
          {mode === 'invite' && <span className="text-xs font-normal text-text-tertiary">At least 10 characters. A short sentence works well.</span>}
        </label>
        {mode === 'invite' && (
          <label className="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
            Type it again
            <input name="again" type="password" required autoComplete="new-password" className={`${field} text-text`} />
          </label>
        )}
        {error && <p className="text-sm text-orange">{error}</p>}
        <button type="submit" disabled={busy} className={button}>
          {busy ? 'Checking...' : mode === 'invite' ? 'Create my login' : 'Sign in'}
        </button>
      </form>
      <div className="mt-6 pt-5 border-t border-border text-sm text-text-secondary">
        {mode === 'signin' ? (
          <>
            First time here?{' '}
            <button type="button" onClick={() => switchTo('invite')} className="font-semibold text-text underline decoration-blue underline-offset-4">
              I have an invite code
            </button>
            <div className="pt-3 text-text-tertiary">Forgot your password? Ask LinoCon Digital for a new invite code.</div>
          </>
        ) : (
          <>
            Already set up?{' '}
            <button type="button" onClick={() => switchTo('signin')} className="font-semibold text-text underline decoration-blue underline-offset-4">
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}
