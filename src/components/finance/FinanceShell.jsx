import { NavLink } from 'react-router-dom'
import Mark from '../Logo'
import Icon from './Icon'
import { SECTIONS } from '../../lib/finance'

const path = (key) => (key ? `/finance/${key}` : '/finance')

// The app frame: a sidebar on computers, a bottom tab bar on phones.
export default function FinanceShell({ children, role, ownerName, onSignOut }) {
  const roleName = role === 'owner' ? 'Owner' : 'Bookkeeper'
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-fin-line px-5 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-1">
          <Mark className="w-7 h-5" gradientId="finMarkSide" />
          <span className="font-display font-bold text-lg">LinoCon</span>
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-fin-muted border border-fin-line rounded-full px-2 py-px">
            Finance
          </span>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.key}
              to={path(s.key)}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] border ${
                  isActive ? 'bg-fin-panel border-fin-line text-text font-semibold' : 'border-transparent text-fin-muted hover:text-text'
                }`
              }
            >
              <Icon name={s.icon} />
              {s.name}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 px-1">
          <span className="w-9 h-9 rounded-full fin-grad grid place-items-center font-bold text-white">{ownerName.slice(0, 1)}</span>
          <div className="text-sm leading-tight">
            <p className="font-semibold">{ownerName}</p>
            <p className="text-fin-muted">
              {roleName} ·{' '}
              <button type="button" onClick={onSignOut} className="underline hover:text-text">
                Sign out
              </button>
            </p>
          </div>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-2">
          <Mark className="w-6 h-5" gradientId="finMarkTop" />
          <span className="font-display font-bold">LinoCon</span>
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-fin-muted border border-fin-line rounded-full px-2 py-px">
            Finance
          </span>
        </div>
        <button type="button" onClick={onSignOut} className="text-sm font-semibold text-fin-muted">
          Sign out
        </button>
      </header>

      <main className="flex-1 min-w-0 px-4 md:px-10 pt-6 md:pt-9 pb-32 md:pb-16">{children}</main>

      <PhoneTabs />
    </div>
  )
}

const TABS = ['', 'invoices', 'expenses', 'income', 'gst']

function PhoneTabs() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-fin-line bg-ink/95 backdrop-blur grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((key) => {
        const s = SECTIONS.find((x) => x.key === key)
        if (key === 'expenses') {
          return (
            <NavLink key={key} to={path(key)} className="flex flex-col items-center -mt-5 pb-2 text-xs text-fin-muted">
              <span className="w-12 h-12 rounded-full fin-grad grid place-items-center text-white shadow-lg shadow-fin-violet/30">
                <Icon name="plus" className="w-6 h-6" />
              </span>
              <span className="mt-1">Expense</span>
            </NavLink>
          )
        }
        return (
          <NavLink
            key={key}
            to={path(key)}
            end
            className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-xs ${isActive ? 'text-text font-semibold' : 'text-fin-muted'}`}
          >
            <Icon name={s.icon} />
            {s.short ?? s.name}
          </NavLink>
        )
      })}
    </nav>
  )
}
