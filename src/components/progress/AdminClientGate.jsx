import { Link } from 'react-router-dom'
import { Notice, SetupNotice } from './PrivateShell'
import FinanceLogin from '../finance/FinanceLogin'
import { adminSignOut } from '../../lib/clientProgress'

// Loading and error states for Lino's client pages; renders `children` once
// the client has loaded. Pages show <AdminSignIn> instead while signed out.
export default function AdminClientGate({ state, children }) {
  return (
    <>
      {state.status === 'loading' && <p className="text-text-secondary">Loading...</p>}
      {state.status === 'setup' && <SetupNotice />}
      {state.status === 'missing' && (
        <Notice title="Client not found">
          <Link to="/admin" className="underline decoration-blue underline-offset-4">
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

// Same password and authenticator code as the finance app.
export const AdminSignIn = ({ onSignedIn }) => <FinanceLogin app="admin" onSignedIn={onSignedIn} />

export function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={() => adminSignOut().finally(() => window.location.assign('/admin'))}
      className="text-sm font-semibold text-text-secondary hover:text-text"
    >
      Sign out
    </button>
  )
}
