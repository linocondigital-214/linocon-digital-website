import { Link, useNavigate, useParams } from 'react-router-dom'
import PrivateShell from '../components/progress/PrivateShell'
import AdminClientGate from '../components/progress/AdminClientGate'
import ProgressBoard from '../components/progress/ProgressBoard'
import CopyLinkButton from '../components/progress/CopyLinkButton'
import { removeClient } from '../lib/clientProgress'
import useAdminClient, { SAVING_TEXT } from '../lib/useAdminClient'
import usePageMeta from '../lib/usePageMeta'

// /clients/<id>: where Lino ticks off a client's progress.
export default function ClientEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { password, state, saving, signIn, onChange } = useAdminClient(id)
  usePageMeta(state.client ? `${state.client.details.name} (edit)` : 'Client progress')

  async function onDelete() {
    if (!window.confirm(`Delete ${state.client.details.name} and all their progress? This can't be undone.`)) return
    await removeClient(password, id)
    navigate('/clients')
  }

  const actions = state.status === 'ready' && (
    <span className="text-sm text-text-secondary" aria-live="polite">
      {SAVING_TEXT[saving] ?? ''}
    </span>
  )

  return (
    <PrivateShell actions={actions}>
      <AdminClientGate state={state} signIn={signIn}>
        <>
          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-border">
            <Link to="/clients" className="text-sm font-semibold text-text-secondary! hover:text-text! mr-auto">
              &larr; All clients
            </Link>
            <CopyLinkButton id={id} />
            <a
              href={`/progress/${id}`}
              target="_blank"
              rel="noreferrer"
              className="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary"
            >
              View as client
            </a>
            <button type="button" onClick={onDelete} className="h-11 px-4 text-sm font-semibold text-text-tertiary hover:text-orange">
              Delete
            </button>
          </div>
          <ProgressBoard client={state.client} editable onChange={onChange} docBase={`/clients/${id}`} />
        </>
      </AdminClientGate>
    </PrivateShell>
  )
}
