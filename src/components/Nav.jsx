import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { SERVICES, servicePath } from '../lib/services'
import { LIVE_STEPS, stepPath } from '../lib/process'

const SERVICE_ITEMS = SERVICES.map((s) => ({ to: servicePath(s), name: s.name, menu: s.menu }))
const STEP_ITEMS = LIVE_STEPS.map((s) => ({ to: stepPath(s), name: `${s.n} ${s.name}`, menu: s.menu }))

// The Services and Process menus. Process only becomes a menu once at least one
// step has its own page; until then it's a plain link to the homepage section.
const MENUS = [
  { label: 'Services', items: SERVICE_ITEMS, allHref: '/#services', allLabel: 'See all services' },
  ...(STEP_ITEMS.length
    ? [{ label: 'Process', items: STEP_ITEMS, allHref: '/#process', allLabel: 'See the full process' }]
    : []),
]

const LINKS = [
  ...(STEP_ITEMS.length ? [] : [{ href: '/#process', label: 'Process' }]),
  { href: '/#work', label: 'Work' },
  { href: '/#audit', label: 'Free audit' },
  { href: '/#faq', label: 'FAQ' },
]

function Chevron({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Desktop: opens on hover, or on click / Enter for touch screens and keyboards.
function DropdownMenu({ menu }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  // Set when a mouse hover opened the menu, so the click that usually follows
  // doesn't immediately close it again.
  const viaHover = useRef(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        viaHover.current = true
        setOpen(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return
        viaHover.current = false
        setOpen(false)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (viaHover.current) viaHover.current = false
          else setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
          open ? 'text-text' : 'text-text-secondary hover:text-text'
        }`}
      >
        {menu.label}
        <Chevron open={open} />
      </button>

      {/* pt-4 bridges the gap under the button so the menu stays open while
          the pointer moves down into it. */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-[opacity,transform] duration-200 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none invisible'
        }`}
      >
        <div className="w-[360px] rounded-2xl border border-border bg-ink/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-2">
          {menu.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col gap-1 rounded-xl px-4 py-3 hover:bg-white/5 focus-visible:bg-white/5 transition-colors"
            >
              <span className="text-sm font-bold text-text">{item.name}</span>
              <span className="text-[13px] leading-snug text-text-secondary">{item.menu}</span>
            </Link>
          ))}
          <a
            href={menu.allHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between mt-1 rounded-xl px-4 py-3 border-t border-border text-[13px] font-bold text-text-secondary hover:text-text transition-colors"
          >
            {menu.allLabel}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // Which menu is expanded in the phone menu, by label.
  const [expanded, setExpanded] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setExpanded(null)
  }, [location])

  const solid = scrolled || open
  const isHome = location.pathname === '/'

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        solid
          ? 'bg-ink/85 backdrop-blur-xl border-b border-border'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
        <Link to="/" aria-label="LinoCon Digital home" onClick={() => window.scrollTo(0, 0)}>
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap">
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            aria-current={isHome ? 'page' : undefined}
            className={`text-sm font-semibold transition-colors ${
              isHome ? 'text-text' : 'text-text-secondary hover:text-text'
            }`}
          >
            Home
          </Link>
          {MENUS.map((menu) => (
            <DropdownMenu key={menu.label} menu={menu} />
          ))}
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-text-secondary hover:text-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/articles"
            className="text-sm font-semibold text-text-secondary hover:text-text transition-colors"
          >
            Articles
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/book"
            className="flex items-center h-10 md:h-11 px-4 md:px-6 rounded-full bg-gradient-brand text-ink text-sm font-bold whitespace-nowrap"
          >
            <span className="sm:hidden">Book a call</span>
            <span className="hidden sm:inline">Book a Strategy Call</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/15"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {open ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border px-5 pb-6 pt-2 flex flex-col max-h-[calc(100svh-4rem)] overflow-y-auto">
          <Link
            to="/"
            onClick={() => {
              setOpen(false)
              window.scrollTo(0, 0)
            }}
            aria-current={isHome ? 'page' : undefined}
            className="py-4 text-lg font-semibold border-b border-border"
          >
            Home
          </Link>
          {MENUS.map((menu) => {
            const isOpen = expanded === menu.label
            return (
              <div key={menu.label} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : menu.label)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-4 text-lg font-semibold"
                >
                  {menu.label}
                  <Chevron open={isOpen} />
                </button>
                {isOpen && (
                  <div className="flex flex-col pb-3 pl-4 border-l border-white/15 ml-1 mb-2">
                    {menu.items.map((item) => (
                      <Link key={item.to} to={item.to} className="py-2.5 flex flex-col">
                        <span className="text-base font-semibold">{item.name}</span>
                        <span className="text-sm text-text-secondary">{item.menu}</span>
                      </Link>
                    ))}
                    <a
                      href={menu.allHref}
                      onClick={() => setOpen(false)}
                      className="py-2.5 text-sm font-bold text-text-secondary"
                    >
                      {menu.allLabel} &rarr;
                    </a>
                  </div>
                )}
              </div>
            )
          })}
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-4 text-lg font-semibold border-b border-border"
            >
              {l.label}
            </a>
          ))}
          <Link to="/articles" className="py-4 text-lg font-semibold">
            Articles
          </Link>
        </nav>
      )}
    </header>
  )
}
