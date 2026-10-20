import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import Reveal from '../components/Reveal'
import { Eyebrow, Headline, PageSections } from '../components/PageSections'
import { BOOKS_PLANS } from '../lib/books'
import { mailtoLink, sendLead } from '../lib/leads'
import { track } from '../lib/analytics'
import usePageMeta from '../lib/usePageMeta'

const SUBJECT = 'LinoCon Books Waitlist — LinoCon Digital'

const SECTIONS = [
  {
    type: 'cards',
    eyebrow: "What's inside",
    heading: 'Simple books, made for small businesses.',
    items: [
      { title: 'One clear dashboard', body: 'Money in, money out, profit and sales tax owing for this month and this year, at a glance.' },
      { title: 'Invoices that get paid', body: 'Branded invoices with your sales tax added for you and a Pay now button. They mark themselves paid.' },
      { title: 'Expenses from your phone', body: 'Snap the receipt, type the amount, done. Categories are suggested for you.' },
      { title: 'Sales tax made simple', body: 'Set up for the tax where you do business, like GST/HST in Canada. Collected and paid for each filing period, ready when it’s time to file.' },
      { title: 'Export for your accountant', body: 'One button gives your accountant a clean spreadsheet and your receipts.' },
      { title: 'Secure login', body: 'Password plus a one-time code, and an optional limited login for your bookkeeper.' },
    ],
  },
  {
    type: 'process',
    eyebrow: 'How it works',
    heading: 'Pay for it for a year. Then it’s yours.',
    steps: [
      {
        title: 'Set up on your domain',
        body: 'Your app opens at your own address, like books.yourbusiness.ca, with your name and logo on every invoice.',
      },
      {
        title: '12 monthly payments',
        body: 'Hosting, backups, updates and support are included for the whole first year.',
      },
      {
        title: 'You own it',
        body: 'After month 12 the app and all your data are yours. Keep our low-cost Care plan, or take it with you.',
      },
    ],
  },
  {
    // Only what the app really does: it's the same sign-in LinoCon Digital
    // uses for its own books at /finance.
    type: 'cards',
    eyebrow: 'Security',
    heading: 'How your books stay safe.',
    intro: 'Your money records are private. These are the same protections we use for LinoCon Digital’s own books.',
    items: [
      {
        title: 'Two-step sign-in',
        body: 'Your password plus a 6-digit code from an app on your phone. Someone who only has your password still can’t get in.',
      },
      {
        title: 'Backup codes',
        body: 'Lost your phone? One-time backup codes, given to you at setup, let you back in so you’re never locked out of your own books.',
      },
      {
        title: 'Stops password guessing',
        body: 'After 5 wrong tries, sign-in pauses for 15 minutes, which makes guessing your password useless.',
      },
      {
        title: 'Signs itself out',
        body: 'After 30 minutes without use you’re signed out, so a laptop left open isn’t an open door.',
      },
      {
        title: 'Private and kept apart',
        body: 'Your app isn’t linked anywhere or listed on Google, every page uses a secure (https) connection, and your records are kept separate from other businesses.',
      },
      {
        title: 'Card details stay with Stripe',
        body: 'When customers pay an invoice online, Stripe handles the card. Card numbers never reach your app.',
      },
    ],
  },
  {
    type: 'checklist',
    eyebrow: 'Who it’s for',
    heading: 'Built for owners who do their own books.',
    intro: 'If you invoice customers and file sales tax, but find big accounting software confusing or pricey, this is for you.',
    note: 'If your accountant needs you on a specific accounting program, or you need payroll or inventory, we’ll tell you honestly that another tool is a better fit.',
    items: [
      'Sole owners and small teams',
      'Trades, salons, studios and clinics',
      'Consultants and service businesses',
      'Owners who send a file to an accountant once a year',
    ],
  },
]

export default function Books() {
  usePageMeta(
    'LinoCon Books: Your Own Bookkeeping App (Coming Soon)',
    'A simple bookkeeping app for small businesses: invoices, expenses, sales tax and an export for your accountant. Pay for 12 months, then it’s yours. Join the founding waitlist.',
  )

  // /books#waitlist links come from other pages; scroll once the form is there.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Hero />
      <PageSections sections={SECTIONS} />
      <Plans />
      <Waitlist />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
      <div className="pointer-events-none absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full opacity-20 bg-[radial-gradient(closest-side,var(--color-blue),transparent)]" />
      <div className="pointer-events-none absolute -top-12 -right-72 w-[880px] h-[880px] rounded-full opacity-15 bg-[radial-gradient(closest-side,var(--color-orange),transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-[50fr_50fr] gap-12 lg:gap-14 items-center">
        <m.div
          initial={{ y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6"
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-text-tertiary">
            <span className="text-[11px] tracking-wider px-3 py-1 rounded-full bg-gradient-brand text-ink">Coming soon</span>
            LinoCon Books
          </span>
          <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
            <Headline text="Your own bookkeeping app. Not another subscription." accent="Your own" />
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance">
            Invoices, expenses, sales tax and a clean export for your accountant, on your own domain. Pay for it
            over 12 months, then the app and your data are yours.
          </p>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <a
              href="#waitlist"
              className="flex items-center justify-center h-14 px-7 rounded-full bg-gradient-brand text-ink text-base font-bold"
            >
              Join the founding waitlist
            </a>
            <Link
              to="/book"
              className="flex items-center justify-center h-14 px-7 rounded-full border border-white/20 text-base font-bold hover:bg-white/5 transition-colors"
            >
              Book a strategy call
            </Link>
          </div>
        </m.div>
        <AppPreview />
      </div>
    </section>
  )
}

// A simple drawing of the app, not a screenshot: it isn't released yet.
function AppPreview() {
  const tiles = [
    { label: 'Money in', tone: 'from-blue/30' },
    { label: 'Money out', tone: 'from-orange/25' },
    { label: 'Tax owing', tone: 'from-white/10' },
  ]
  const rows = ['Invoice sent', 'Invoice paid', 'Receipt added', 'Tax period ready']
  return (
    <div aria-hidden="true" className="w-full max-w-xl mx-auto lg:max-w-none">
      <div className="rounded-3xl border border-white/10 bg-surface shadow-2xl shadow-black/60 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-surface-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="ml-3 text-xs text-text-tertiary">books.yourbusiness.ca</span>
        </div>
        <div className="p-5 md:p-7 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            {tiles.map((t) => (
              <div key={t.label} className={`rounded-2xl border border-border bg-gradient-to-br ${t.tone} to-surface p-4 flex flex-col gap-3`}>
                <span className="text-xs font-semibold text-text-secondary">{t.label}</span>
                <span className="h-3 w-3/4 rounded-full bg-white/15" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border p-4 flex items-end gap-2 h-28">
            {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
              <span key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-blue/60 to-orange/50" style={{ height: `${h}%` }} />
            ))}
          </div>
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
            {rows.map((r) => (
              <li key={r} className="flex items-center justify-between px-4 py-3 text-sm text-text-secondary">
                {r}
                <span className="h-2.5 w-16 rounded-full bg-white/10" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="9" cy="9" r="9" fill="#2E6BFF" fillOpacity="0.18" />
      <path d="M5.5 9.2l2.2 2.2 4.8-4.8" stroke="#2E6BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Plans() {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal className="mb-12">
          <Eyebrow>Founding prices</Eyebrow>
          <h2 className="font-display font-bold leading-tight mt-4 text-balance text-3xl md:text-5xl max-w-3xl">
            Low founding prices for our first clients.
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed max-w-3xl mt-5">
            Nothing to pay today. Join the waitlist and we&rsquo;ll contact you when your spot is ready.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {BOOKS_PLANS.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 0.08}
              className={`relative rounded-3xl border p-7 md:p-8 flex flex-col gap-6 ${
                p.featured ? 'border-blue bg-gradient-to-br from-blue/20 via-surface to-orange/15' : 'border-border bg-surface'
              }`}
            >
              <h3 className="font-display font-bold text-2xl md:text-3xl">{p.name}</h3>
              <div>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display font-bold text-4xl md:text-5xl">{p.price}</span>
                  <span className="text-text-secondary">{p.unit}</span>
                </p>
                <p className="text-sm text-text-secondary mt-2">{p.note}</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-text-secondary">
                    <Check />
                    {pt}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-text-secondary leading-relaxed">
          <span className="font-bold text-text">Better in a bundle: </span>
          add Books to a Launch Bundle for $39.99 / month, or get it with your website, SEO and backlinks in{' '}
          <a href="/#bundles" className="font-bold text-text underline decoration-blue underline-offset-4">
            LinoCon Complete
          </a>
          .
        </Reveal>
        <p className="text-sm text-text-secondary pt-6">
          Prices in Canadian dollars. Taxes extra where applicable. The Care plan covers hosting, backups,
          security and tax-rule updates, and support.
        </p>
      </div>
    </section>
  )
}

function Waitlist() {
  const [status, setStatus] = useState('form') // 'form' | 'sending' | 'sent' | 'mailto'

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const fields = {
      name: form.name.value,
      email: form.email.value,
      business: form.business.value,
      interest: form.interest.value,
    }
    setStatus('sending')
    if (await sendLead(SUBJECT, fields)) {
      track('generate_lead', { form_name: 'books_waitlist', lead_delivery: 'web_form' })
      setStatus('sent')
    } else {
      track('generate_lead', { form_name: 'books_waitlist', lead_delivery: 'email_app' })
      window.location.href = mailtoLink(SUBJECT, fields)
      setStatus('mailto')
    }
  }

  const input =
    'w-full min-w-0 h-14 rounded-xl bg-ink/60 border border-border px-5 text-base outline-none focus:border-blue transition-colors'

  return (
    <section id="waitlist" className="py-20 md:py-28 border-t border-border scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal
          y={48}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue/25 via-surface-2 to-orange/20 p-8 sm:p-12 md:p-16 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center"
        >
          <div className="flex flex-col gap-5 min-w-0">
            <Eyebrow>Founding waitlist</Eyebrow>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">
              Be one of the first to own your books.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              We&rsquo;re testing LinoCon Books on our own business first. Join the list to be one of the first
              to use it, at our lowest starting price. Free to join. You can decide later.
            </p>
          </div>

          {status === 'sent' || status === 'mailto' ? (
            <div className="rounded-2xl bg-ink/60 border border-border p-8 flex flex-col gap-3">
              <h3 className="font-display font-bold text-2xl">
                {status === 'sent' ? 'You’re on the list!' : 'Almost there.'}
              </h3>
              <p className="text-text-secondary">
                {status === 'sent'
                  ? 'We’ll email you as soon as LinoCon Books is ready.'
                  : 'Your email app should have opened with your details filled in. Just hit send.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-0">
              <label className="sr-only" htmlFor="books-name">Your name</label>
              <input id="books-name" name="name" type="text" required placeholder="Your name" className={input} />
              <label className="sr-only" htmlFor="books-email">Your email</label>
              <input id="books-email" name="email" type="email" required placeholder="you@yourbusiness.com" className={input} />
              <label className="sr-only" htmlFor="books-business">Your business</label>
              <input id="books-business" name="business" type="text" required placeholder="Your business name" className={input} />
              <label className="sr-only" htmlFor="books-interest">What are you interested in?</label>
              <select id="books-interest" name="interest" defaultValue="LinoCon Books" className={`${input} appearance-none`}>
                <option>LinoCon Books</option>
                <option>LinoCon Complete bundle</option>
                <option>Launch Bundle + Books</option>
                <option>Not sure yet</option>
              </select>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-14 rounded-full bg-gradient-brand text-ink text-base font-bold disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Join the waitlist'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
