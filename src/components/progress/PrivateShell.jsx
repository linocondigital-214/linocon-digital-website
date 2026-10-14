import { Link } from 'react-router-dom'
import { Logo } from '../Logo'
import { useNoIndex } from '../../lib/clientProgress'

// Frame for the private client pages: brand header, no site menu or footer.
export default function PrivateShell({ children, actions }) {
  useNoIndex()
  return (
    <div className="min-h-screen">
      <header className="no-print max-w-6xl mx-auto px-4 md:px-10 pt-6 md:pt-8 flex items-center justify-between gap-4">
        <Link to="/" aria-label="LinoCon Digital home">
          <Logo />
        </Link>
        {actions}
      </header>
      <div className="print-main max-w-6xl mx-auto px-4 md:px-10 pt-10 md:pt-14 pb-24">{children}</div>
    </div>
  )
}

export function Notice({ title, children }) {
  return (
    <div className="max-w-xl rounded-2xl border border-border bg-surface p-6 md:p-8">
      <h1 className="font-display font-bold text-2xl md:text-3xl">{title}</h1>
      <div className="text-text-secondary mt-3 flex flex-col gap-3">{children}</div>
    </div>
  )
}

// Shown on Lino's pages until the Vercel storage and password are set up.
export function SetupNotice() {
  return (
    <Notice title="Almost ready">
      <p>The client pages need two settings in Vercel before they can save anything: the storage connection and your admin password.</p>
      <p>The step-by-step instructions are in the project thread.</p>
    </Notice>
  )
}
