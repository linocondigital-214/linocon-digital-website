import { useCallback, useEffect, useRef, useState } from 'react'
import { changeClient, fetchClient, rememberPassword, savedPassword } from './clientProgress'

// Applies changes locally right away so ticking feels instant.
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

// Loads one client for Lino's pages and saves each change to /api.
export default function useAdminClient(id) {
  const [password, setPassword] = useState(savedPassword)
  const [state, setState] = useState({ status: password ? 'loading' : 'login' })
  const [saving, setSaving] = useState('idle') // 'idle' | 'saving' | 'saved' | 'failed'
  const pending = useRef(0)

  const signIn = useCallback((pw) => {
    rememberPassword(pw)
    setPassword(pw)
    setState({ status: 'loading' })
  }, [])

  const signOut = useCallback((wrong) => {
    rememberPassword('')
    setPassword('')
    setState({ status: 'login', wrong })
  }, [])

  const load = useCallback(
    (pw) => {
      fetchClient(id, pw)
        .then((client) => setState({ status: 'ready', client }))
        .catch((err) => {
          if (err.status === 401) signOut(true)
          else setState({ status: err.status === 404 ? 'missing' : err.code === 'setup' ? 'setup' : 'error' })
        })
    },
    [id, signOut],
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
      if (err.status === 401) return signOut(true)
      setSaving('failed')
      load(password)
    }
  }

  return { password, state, saving, signIn, onChange }
}

export const SAVING_TEXT = {
  saving: 'Saving...',
  saved: 'All changes saved',
  failed: "Couldn't save. Check your connection and try again.",
}
