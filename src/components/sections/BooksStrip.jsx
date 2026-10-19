import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { BOOKS } from '../../lib/books'

// A short homepage teaser for LinoCon Books, between Services and Bundles.
export default function BooksStrip() {
  return (
    <section className="pb-4">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <Link
            to={BOOKS.path}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-blue/20 via-surface-2 to-orange/15 px-7 py-6 md:px-10 md:py-8 hover:border-blue transition-colors"
          >
            <div className="flex flex-col gap-2">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-brand text-ink whitespace-nowrap">
                  New · Coming soon
                </span>
                <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">{BOOKS.name}</span>
              </span>
              <p className="font-display font-bold text-2xl md:text-3xl leading-snug text-balance">
                Your own bookkeeping app, <span className="text-gradient">on your own domain.</span>
              </p>
              <p className="text-text-secondary">
                Invoices, expenses and GST in one simple app. Pay for 12 months, then it&rsquo;s yours.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-bold whitespace-nowrap">
              See LinoCon Books
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
