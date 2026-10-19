import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FinanceLogin, { Card } from '../components/finance/FinanceLogin'
import FinanceShell from '../components/finance/FinanceShell'
import Dashboard from '../components/finance/Dashboard'
import { SECTIONS, fetchSummary, fetchStatus, signOutFinance } from '../lib/finance'
import { useNoIndex } from '../lib/clientProgress'
import usePageMeta from '../lib/usePageMeta'

// /finance: LinoCon Digital's private books. Not linked from the site and
// kept out of search. Signing in takes the password and a code from an
// authenticator app (see api/_lib/finance/auth.js).
export default function Finance() {
  usePageMeta('Finance')
  useNoIndex()
  const { section = '' } = useParams()
  const [state, setState] = useState({ status: 'loading' })

  const load = useCallback(() => {
    setState({ status: 'loading' })
    fetchStatus()
      .then((s) => (s.signedIn ? fetchSummary() : null))
      .then((data) => setState(data ? { status: 'ready', ...data } : { status: 'signin' }))
      .catch((err) => {
        if (err.status === 401) setState({ status: 'signin' })
        else setState({ status: err.code === 'setup' ? 'setup' : 'error' })
      })
  }, [])

  useEffect(load, [load])

  async function signOut() {
    await signOutFinance().catch(() => {})
    setState({ status: 'signin' })
  }

  if (state.status === 'loading') return <div className="min-h-screen fin-glow" />
  if (state.status === 'signin') return <FinanceLogin onSignedIn={load} />
  if (state.status === 'setup')
    return (
      <Card>
        <h1 className="font-display font-bold text-2xl">Almost ready</h1>
        <div className="text-fin-muted mt-3">
          The finance app needs its own password set in Vercel before anyone can sign in. The steps are in the project thread.
        </div>
      </Card>
    )
  if (state.status === 'error')
    return (
      <Card>
        <h1 className="font-display font-bold text-2xl">Couldn't load your books</h1>
        <div className="text-fin-muted mt-3">Please refresh the page in a moment.</div>
      </Card>
    )

  const current = SECTIONS.find((s) => s.key === section)
  return (
    <FinanceShell role={state.role} ownerName={state.summary.ownerName} onSignOut={signOut}>
      {!current || !current.key ? (
        <>
          <Dashboard summary={state.summary} />
          {state.recoveryCodesLeft <= 2 && (
            <div className="mt-6 max-w-6xl text-sm text-fin-warn">
              Only {state.recoveryCodesLeft} recovery {state.recoveryCodesLeft === 1 ? 'code is' : 'codes are'} left. Ask in the project
              thread for a fresh set.
            </div>
          )}
        </>
      ) : (
        <div className="max-w-xl rounded-2xl border border-fin-line bg-fin-panel p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Coming next</p>
          <h1 className="font-display font-bold text-3xl pt-2">{current.name}</h1>
          <div className="text-fin-muted mt-3">{current.soon}</div>
        </div>
      )}
    </FinanceShell>
  )
}
