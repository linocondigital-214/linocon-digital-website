import { Link } from 'react-router-dom'
import { Logo } from '../Logo'
import { CONTACT_EMAIL } from '../../lib/leads'
import { SERVICES, servicePath } from '../../lib/services'

const COLUMNS = [
  {
    title: 'Services',
    links: [
      ...SERVICES.map((s) => ({ to: servicePath(s), label: s.name })),
      { href: '/#audit', label: 'Free website audit' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/#work', label: 'Our work' },
      { href: '/#process', label: 'How we work' },
      { href: '/#faq', label: 'FAQ' },
      { to: '/articles', label: 'Articles' },
    ],
  },
  {
    title: 'Recent projects',
    links: [
      { href: 'https://www.maplesheet.ca', label: 'MapleSheet Co.', external: true },
      { href: 'https://finelinesglass.ca', label: 'Finelines Glass', external: true },
    ],
  },
]

const linkClass = 'text-sm text-text-secondary hover:text-text transition-colors'

function FooterLink({ link }) {
  if (link.to) {
    return <Link to={link.to} className={linkClass}>{link.label}</Link>
  }
  return (
    <a
      href={link.href}
      className={`${linkClass} inline-flex items-center gap-1.5`}
      {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
    >
      {link.label}
      {link.external && (
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4 10L10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border pt-12 md:pt-14">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16 pb-10">
          <div className="flex flex-col items-start gap-4">
            <Logo />
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              <span className="block font-display font-bold text-base text-text mb-1">
                Get found. Get chosen. Get <span className="text-gradient">growing.</span>
              </span>
              Websites, SEO and backlinks for businesses that want more customers.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/book"
                className="flex items-center h-9 px-4 rounded-full bg-gradient-brand text-ink text-[13px] font-bold"
              >
                Book a free call
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center h-9 px-4 rounded-full border border-white/15 text-[13px] font-bold hover:bg-white/5 transition-colors"
              >
                Email us
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
                  {col.title}
                </span>
                {col.links.map((l) => (
                  <FooterLink key={l.label} link={l} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-6 border-t border-border">
          <span className="text-[13px] text-text-tertiary">
            &copy; {new Date().getFullYear()} LinoCon Digital. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="text-[13px] text-text-secondary hover:text-text transition-colors">
              Privacy Policy
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[13px] text-text-secondary hover:text-text transition-colors">
              {CONTACT_EMAIL}
            </a>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex items-center gap-1.5 text-[13px] font-bold text-text-secondary hover:text-text transition-colors"
            >
              Back to top
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
