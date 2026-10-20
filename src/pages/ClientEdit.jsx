import { Link, useNavigate, useParams } from 'react-router-dom'
import PrivateShell from '../components/progress/PrivateShell'
import AdminClientGate, { AdminSignIn, AdminSignOut } from '../components/progress/AdminClientGate'
import ProgressBoard from '../components/progress/ProgressBoard'
import ClientLogin from '../components/progress/ClientLogin'
import { WorkLogForm, WorkLogList } from '../components/progress/WorkLog'
import { logEntries } from '../lib/clientOverview'
import { isShared } from '../lib/clientDocs'
import { removeClient } from '../lib/clientProgress'
import useAdminClient, { SAVING_TEXT } from '../lib/useAdminClient'
import usePageMeta from '../lib/usePageMeta'

// /admin/<id>: where Lino ticks off a client's progress and manages the
// client's login.
export default function ClientEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, saving, reload, onChange } = useAdminClient(id)
  usePageMeta(state.client ? `${state.client.details.name} (edit)` : 'Client progress')

  async function onDelete() {
    if (!window.confirm(`Delete ${state.client.details.name}, all their progress and their login? This can't be undone.`)) return
    await removeClient(id)
    navigate('/admin')
  }

  if (state.status === 'login') return <AdminSignIn onSignedIn={reload} />

  const actions = state.status === 'ready' && (
    <div className="flex items-center gap-5">
      <span className="text-sm text-text-secondary" aria-live="polite">
        {SAVING_TEXT[saving] ?? ''}
      </span>
      <AdminSignOut />
    </div>
  )

  return (
    <PrivateShell actions={actions}>
      <AdminClientGate state={state}>
        <>
          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-border">
            <Link to="/admin" className="text-sm font-semibold text-text-secondary! hover:text-text! mr-auto">
              &larr; All clients
            </Link>
            <a href="#worklog" className="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary">
              Work log
            </a>
            <Link
              to={`/admin/${id}/preview`}
              className="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary"
            >
              View as client
            </Link>
            <button type="button" onClick={onDelete} className="h-11 px-4 text-sm font-semibold text-text-tertiary hover:text-orange">
              Delete
            </button>
          </div>
          {state.client && <ClientLogin client={state.client} />}
          <ProgressBoard client={state.client} editable onChange={onChange} docBase={`/admin/${id}`} />
          <section id="worklog" className="mt-16 pt-10 border-t border-border scroll-mt-24" aria-labelledby="worklog-heading">
            <h2 id="worklog-heading" className="font-display font-bold text-2xl md:text-3xl">
              Work log
            </h2>
            <p className="text-text-secondary mt-1 mb-5">Dated notes on what you did for this client. Only you see this.</p>
            <WorkLogForm onAdd={(_, changes) => onChange(changes)} />
            <div className="mt-6">
              <WorkLogList entries={state.client ? logEntries([state.client]) : []} onDelete={(_, changes) => onChange(changes)} />
            </div>
          </section>
        </>
      </AdminClientGate>
    </PrivateShell>
  )
}

// /admin/<id>/preview: what the client sees once signed in at /clients.
export function ClientPreview() {
  const { id } = useParams()
  const { state, reload } = useAdminClient(id)
  usePageMeta(state.client ? `${state.client.details.name} (client view)` : 'Client view')
  if (state.status === 'login') return <AdminSignIn onSignedIn={reload} />

  return (
    <PrivateShell actions={state.status === 'ready' && <AdminSignOut />}>
      <AdminClientGate state={state}>
        <>
          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-border">
            <Link to={`/admin/${id}`} className="text-sm font-semibold text-text-secondary! hover:text-text! mr-auto">
              &larr; Back to editing
            </Link>
            <span className="text-sm font-semibold text-orange">Preview: this is what your client sees</span>
          </div>
          {state.client && <ProgressBoard client={clientView(state.client)} docBase={`/admin/${id}`} />}
        </>
      </AdminClientGate>
    </PrivateShell>
  )
}

// Same as publicView in api/_lib/client.js: drafts and the work log stay private.
function clientView(client) {
  const docs = Object.fromEntries(Object.entries(client.docs ?? {}).filter(([key]) => isShared(client, key)))
  const view = { ...client, docs }
  delete view.worklog
  return view
}
