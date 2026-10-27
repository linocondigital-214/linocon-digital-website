import { Link } from 'react-router-dom'
import { Logo } from '../Logo'
import { CONTACT_EMAIL } from '../../lib/leads'
import { SERVICES, servicePath } from '../../lib/services'
import { BOOKS } from '../../lib/books'

const COLUMNS = [
  {
    title: 'Services',
    links: [
      ...SERVICES.map((s) => ({ to: servicePath(s), label: s.name })),
      { to: BOOKS.path, label: BOOKS.comingSoon ? `${BOOKS.name} (coming soon)` : BOOKS.name },
      { href: '/#audit', label: 'Free website audit' },
      { to: '/switch', label: 'Switching to LinoCon' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/#work', label: 'Our work' },
      { href: '/#process', label: 'How we work' },
      { href: '/#faq', label: 'FAQ' },
      { to: '/articles', label: 'Articles' },
      { to: '/refer', label: 'Refer a friend' },
      { to: '/pay', label: 'Pay an invoice' },
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

export const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/linocondigital',
    path: 'M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/linocondigital',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  },
  {
    label: 'X',
    href: 'https://x.com/linocondigital',
    path: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3L17.6 20.65z',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@linocondigital',
    path: 'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
]

function SocialLinks() {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener"
          aria-label={`LinoCon Digital on ${s.label}`}
          title={s.label}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-text-secondary hover:text-text hover:bg-white/5 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  )
}

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
              <span className="block mt-2">
                Based in Vancouver, BC. Working remotely with small businesses across Canada and the US. Prices in CAD.
              </span>
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
            <SocialLinks />
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
            <Link to="/disclaimer" className="text-[13px] text-text-secondary hover:text-text transition-colors">
              Disclaimer
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
