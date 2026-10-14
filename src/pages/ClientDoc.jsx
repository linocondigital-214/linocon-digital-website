import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PrivateShell, { Notice } from '../components/progress/PrivateShell'
import AdminClientGate from '../components/progress/AdminClientGate'
import DocumentView from '../components/progress/DocumentView'
import { DOCS, isShared } from '../lib/clientDocs'
import { fetchClient } from '../lib/clientProgress'
import useAdminClient, { SAVING_TEXT } from '../lib/useAdminClient'
import usePageMeta from '../lib/usePageMeta'

const backLink = (to, label) => (
  <Link to={to} className="no-print block max-w-3xl mx-auto text-sm font-semibold text-text-secondary! hover:text-text! mb-8">
    &larr; {label}
  </Link>
)

// /clients/<id>/<proposal|agreement>: Lino fills in and prints the document.
export function ClientDocEdit() {
  const { id, doc } = useParams()
  const { state, saving, signIn, onChange } = useAdminClient(id)
  usePageMeta(state.client ? `${DOCS[doc]?.name}: ${state.client.details.name}` : 'Client document')
  if (!DOCS[doc]) return <Missing />

  return (
    <PrivateShell
      actions={
        state.status === 'ready' && (
          <span className="text-sm text-text-secondary" aria-live="polite">
            {SAVING_TEXT[saving] ?? ''}
          </span>
        )
      }
    >
      <AdminClientGate state={state} signIn={signIn}>
        {backLink(`/clients/${id}`, state.client?.details.name)}
        <DocumentView client={state.client} docKey={doc} editable onChange={onChange} />
      </AdminClientGate>
    </PrivateShell>
  )
}

// /progress/<id>/<proposal|agreement>: the client's read-only copy, once sent.
export function ClientDocView() {
  const { id, doc } = useParams()
  const [state, setState] = useState({ status: 'loading' })
  usePageMeta(DOCS[doc] ? `${DOCS[doc].name}` : 'Document')

  useEffect(() => {
    fetchClient(id)
      .then((client) => setState({ status: 'ready', client }))
      .catch(() => setState({ status: 'missing' }))
  }, [id])

  if (!DOCS[doc] || state.status === 'missing' || (state.status === 'ready' && !isShared(state.client, doc))) {
    return <Missing />
  }
  return (
    <PrivateShell>
      {state.status === 'loading' ? (
        <p className="text-text-secondary">Loading...</p>
      ) : (
        <>
          {backLink(`/progress/${id}`, 'Back to your progress')}
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
        <p>This document isn't available. Please check the link LinoCon Digital sent you.</p>
      </Notice>
    </PrivateShell>
  )
}
