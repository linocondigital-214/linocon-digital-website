import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PrivateShell, { Notice } from '../components/progress/PrivateShell'
import AdminClientGate, { AdminSignIn, AdminSignOut } from '../components/progress/AdminClientGate'
import DocumentView from '../components/progress/DocumentView'
import { DOCS, isShared } from '../lib/clientDocs'
import { fetchMyProgress } from '../lib/clientProgress'
import useAdminClient, { SAVING_TEXT } from '../lib/useAdminClient'
import usePageMeta from '../lib/usePageMeta'

const backLink = (to, label) => (
  <Link to={to} className="no-print block max-w-3xl mx-auto text-sm font-semibold text-text-secondary! hover:text-text! mb-8">
    &larr; {label}
  </Link>
)

// /admin/<id>/<proposal|agreement>: Lino fills in and prints the document.
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
        <DocumentView client={state.client} docKey={doc} editable onChange={onChange} />
      </AdminClientGate>
    </PrivateShell>
  )
}

// /clients/<proposal|agreement>: the signed-in client's read-only copy, once
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
          <DocumentView client={state.client} docKey={doc} />
        </>
      )}
    </PrivateShell>
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
