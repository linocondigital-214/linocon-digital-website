import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PrivateShell, { Notice, SetupNotice } from '../components/progress/PrivateShell'
import AdminLogin from '../components/progress/AdminLogin'
import ProgressBoard from '../components/progress/ProgressBoard'
import CopyLinkButton from '../components/progress/CopyLinkButton'
import { changeClient, fetchClient, rememberPassword, removeClient, savedPassword } from '../lib/clientProgress'
import usePageMeta from '../lib/usePageMeta'

// Same view the client sees, applied locally right away so ticking feels instant.
function applyLocal(client, changes) {
  const next = structuredClone(client)
  for (const { path, value } of changes) {
    let node = next
    for (const key of path.slice(0, -1)) {
      if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
      node = node[key]
    }
    if (value === null) delete node[path[path.length - 1]]
    else node[path[path.length - 1]] = value
  }
  return next
}

// /clients/<id>: where Lino ticks off a client's progress.
export default function ClientEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState(savedPassword)
  const [state, setState] = useState({ status: password ? 'loading' : 'login' })
  const [saving, setSaving] = useState('idle') // 'idle' | 'saving' | 'saved' | 'failed'
  const pending = useRef(0)
  usePageMeta(state.client ? `${state.client.details.name} (edit)` : 'Client progress')

  const load = useCallback(
    (pw) => {
      fetchClient(id, pw)
        .then((client) => setState({ status: 'ready', client }))
        .catch((err) =>
          setState({ status: err.status === 404 ? 'missing' : err.code === 'setup' ? 'setup' : 'error' }),
        )
    },
    [id],
  )

  useEffect(() => {
    if (password) load(password)
  }, [password, load])

  async function onChange(changes) {
    setState((s) => ({ ...s, client: applyLocal(s.client, changes) }))
    pending.current += 1
    setSaving('saving')
    try {
      const client = await changeClient(password, id, changes)
      pending.current -= 1
      if (pending.current === 0) {
        setState((s) => ({ ...s, client }))
        setSaving('saved')
      }
    } catch (err) {
      pending.current -= 1
      if (err.status === 401) {
        rememberPassword('')
        setPassword('')
        setState({ status: 'login', wrong: true })
        return
      }
      setSaving('failed')
      load(password)
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete ${state.client.details.name} and all their progress? This can't be undone.`)) return
    await removeClient(password, id)
    navigate('/clients')
  }

  const actions = state.status === 'ready' && (
    <span className="text-sm text-text-secondary" aria-live="polite">
      {{ saving: 'Saving...', saved: 'All changes saved', failed: "Couldn't save. Check your connection and try again." }[saving] ?? ''}
    </span>
  )

  return (
    <PrivateShell actions={actions}>
      {state.status === 'login' && (
        <AdminLogin
          wrong={state.wrong}
          onSubmit={(pw) => {
            rememberPassword(pw)
            setPassword(pw)
            setState({ status: 'loading' })
          }}
        />
      )}
      {state.status === 'loading' && <p className="text-text-secondary">Loading...</p>}
      {state.status === 'setup' && <SetupNotice />}
      {state.status === 'missing' && (
        <Notice title="Client not found">
          <Link to="/clients" className="underline decoration-blue underline-offset-4">
            Back to your clients
          </Link>
        </Notice>
      )}
      {state.status === 'error' && (
        <Notice title="Couldn't load this client">
          <p>Please refresh the page in a moment.</p>
        </Notice>
      )}
      {state.status === 'ready' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-border">
            <Link to="/clients" className="text-sm font-semibold text-text-secondary hover:text-text mr-auto">
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
          <ProgressBoard client={state.client} editable onChange={onChange} />
        </>
      )}
    </PrivateShell>
  )
}
