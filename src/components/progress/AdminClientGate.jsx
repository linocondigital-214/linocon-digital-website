import { Link } from 'react-router-dom'
import { Notice, SetupNotice } from './PrivateShell'
import AdminLogin from './AdminLogin'

// Sign-in, loading and error states for Lino's client pages; renders
// `children` once the client has loaded.
export default function AdminClientGate({ state, signIn, children }) {
  return (
    <>
      {state.status === 'login' && <AdminLogin wrong={state.wrong} onSubmit={signIn} />}
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
      {state.status === 'ready' && children}
    </>
  )
}
