import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PrivateShell, { Notice } from '../components/progress/PrivateShell'
import ProgressBoard from '../components/progress/ProgressBoard'
import { fetchClient } from '../lib/clientProgress'
import usePageMeta from '../lib/usePageMeta'

// /progress/<id>: the client's own private, read-only progress page.
export default function ClientProgress() {
  const { id } = useParams()
  const [state, setState] = useState({ status: 'loading' })
  usePageMeta(state.client ? `${state.client.details.name} progress` : 'Project progress')

  useEffect(() => {
    fetchClient(id)
      .then((client) => setState({ status: 'ready', client }))
      .catch((err) => setState({ status: err.status === 404 ? 'missing' : 'error' }))
  }, [id])

  return (
    <PrivateShell>
      {state.status === 'loading' && <p className="text-text-secondary">Loading your progress...</p>}
      {state.status === 'missing' && (
        <Notice title="Page not found">
          <p>This progress link doesn't exist. Please check the link LinoCon Digital sent you.</p>
        </Notice>
      )}
      {state.status === 'error' && (
        <Notice title="Couldn't load your progress">
          <p>Please refresh the page in a moment.</p>
        </Notice>
      )}
      {state.status === 'ready' && <ProgressBoard client={state.client} />}
    </PrivateShell>
  )
}
