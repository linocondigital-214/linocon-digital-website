import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PrivateShell, { Notice } from '../components/progress/PrivateShell'
import AdminClientGate, { AdminSignIn, AdminSignOut } from '../components/progress/AdminClientGate'
import DocumentView from '../components/progress/DocumentView'
import PackageBuilder, { PackageSummary } from '../components/progress/PackageBuilder'
import { SignBox } from '../components/progress/ESign'
import { AskChanges } from '../components/progress/Journey'
import { notifyLino } from '../lib/leads'
import { DOCS, docState, isShared } from '../lib/clientDocs'
import { fetchMyProgress } from '../lib/clientProgress'
import useAdminClient, { SAVING_TEXT } from '../lib/useAdminClient'
import usePageMeta from '../lib/usePageMeta'

const backLink = (to, label) => (
  <Link to={to} className="no-print block max-w-3xl mx-auto text-sm font-semibold text-text-secondary! hover:text-text! mb-8">
    &larr; {label}
  </Link>
)

// /admin/<id>/<package|proposal|agreement>: Lino fills in and prints the document.
export function ClientDocEdit() {
  const { id, doc } = useParams()
  const { state, saving, reload, onChange } = useAdminClient(id)
  usePageMeta(state.client ? `${DOCS[doc]?.name}: ${state.client.details.name}` : 'Client document')
  if (!DOCS[doc]) return <Missing />
  if (state.status === 'login') return <AdminSignIn onSignedIn={reload} />

  return (
    <PrivateShell
      actions={
        state.status === 'ready' && (
          <div className="flex items-center gap-5">
            <span className="text-sm text-text-secondary" aria-live="polite">
              {SAVING_TEXT[saving] ?? ''}
            </span>
            <AdminSignOut />
          </div>
        )
      }
    >
      <AdminClientGate state={state}>
        {backLink(`/admin/${id}`, state.client?.details.name)}
        {DOCS[doc].builder ? (
          state.client && <PackageBuilder client={state.client} onChange={onChange} adminBase={`/admin/${id}`} />
        ) : (
          <DocumentView client={state.client} docKey={doc} editable onChange={onChange} />
        )}
      </AdminClientGate>
    </PrivateShell>
  )
}

// /clients/<package|proposal|agreement>: the signed-in client's read-only copy, once
// Lino marks it as sent.
export function ClientDocView({ doc }) {
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading' })
  usePageMeta(DOCS[doc] ? `${DOCS[doc].name}` : 'Document')

  useEffect(() => {
    fetchMyProgress()
      .then((client) => setState({ status: 'ready', client }))
      .catch((err) => (err.status === 401 ? navigate('/clients', { replace: true }) : setState({ status: 'missing' })))
  }, [navigate])

  if (!DOCS[doc] || state.status === 'missing' || (state.status === 'ready' && !isShared(state.client, doc))) {
    return <Missing />
  }
  return (
    <PrivateShell>
      {state.status === 'loading' ? (
        <p className="text-text-secondary">Loading...</p>
      ) : (
        <>
          {backLink('/clients', 'Back to your progress')}
          <SignedNotice client={state.client} doc={doc} />
          {DOCS[doc].builder ? (
            <>
              <div className="no-print max-w-3xl mx-auto mb-6">
                <button type="button" onClick={() => window.print()} className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold">
                  Print / Save as PDF
                </button>
              </div>
              <PackageSummary client={state.client} />
            </>
          ) : (
            <DocumentView client={state.client} docKey={doc} />
          )}
          {docState(state.client, doc).status === 'sent' && (
            <SignBox docKey={doc} docName={DOCS[doc].name} onSigned={(client) => {
              notifyLino(client, DOCS[doc].signatures ? `signed the ${DOCS[doc].name.toLowerCase()}` : `accepted the ${DOCS[doc].name.toLowerCase()}`)
              setState({ status: 'ready', client })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }} />
          )}
          {docState(state.client, doc).status === 'sent' && !DOCS[doc].signatures && (
            <AskChanges client={state.client} docKey={doc} docName={DOCS[doc].name} onClient={(client) => setState({ status: 'ready', client })} />
          )}
        </>
      )}
    </PrivateShell>
  )
}

// Above a document the client has signed or accepted.
function SignedNotice({ client, doc }) {
  const state = docState(client, doc)
  if (!state.esign) return null
  const both = !DOCS[doc].signatures || state.ownerName
  return (
    <div className="no-print max-w-3xl mx-auto mb-6 rounded-2xl border border-blue/50 bg-blue/10 p-5">
      <div className="font-bold">
        {DOCS[doc].signatures ? (both ? 'Signed by you and LinoCon Digital' : 'Thank you for signing') : 'Thank you for accepting'}
      </div>
      <div className="text-sm text-text-secondary pt-1">
        {both
          ? 'Click "Print / Save as PDF" to keep a copy.'
          : 'LinoCon Digital will add their signature next, and you will get your signed copy.'}
      </div>
    </div>
  )
}

function Missing() {
  return (
    <PrivateShell>
      <Notice title="Page not found">
        <p>This document isn't available yet.</p>
        <Link to="/clients" className="underline decoration-blue underline-offset-4">
          Back to your progress
        </Link>
      </Notice>
    </PrivateShell>
  )
}
