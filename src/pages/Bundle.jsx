import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { m } from 'framer-motion'
import Reveal from '../components/Reveal'
import BackgroundVideo from '../components/BackgroundVideo'
import { Arrow, Eyebrow, Heading, Headline, PageSections } from '../components/PageSections'
import { BUNDLES, bundlePath, getBundle } from '../lib/bundles'
import { BUNDLE_PAGES } from '../lib/bundlePages'
import { SERVICES, servicePath } from '../lib/services'
import { BOOKS } from '../lib/books'
import { articles } from '../lib/articles'
import usePageMeta from '../lib/usePageMeta'

const WAITLIST = '/books#waitlist'

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="9" cy="9" r="9" fill="#2E6BFF" fillOpacity="0.18" />
      <path d="M5.5 9.2l2.2 2.2 4.8-4.8" stroke="#2E6BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// "Book a strategy call" for bundles you can buy today; "Join the waitlist"
// first for LinoCon Complete, which is coming soon.
function BundleButtons({ b, center = false }) {
  const primary = 'flex items-center justify-center h-14 px-7 rounded-full bg-gradient-brand text-ink text-base font-bold'
  const secondary =
    'flex items-center justify-center h-14 px-7 rounded-full border border-white/20 text-base font-bold hover:bg-white/5 transition-colors'
  return (
    <div
      className={`w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 ${
        center ? 'justify-center' : 'justify-center lg:justify-start'
      }`}
    >
      {b.comingSoon ? (
        <>
          <Link to={WAITLIST} className={primary}>
            Join the waitlist
          </Link>
          <Link to="/book" className={secondary}>
            Book a strategy call
          </Link>
        </>
      ) : (
        <>
          <Link to="/book" className={primary}>
            Book a strategy call
          </Link>
          <a href="/#audit" className={secondary}>
            Get a free audit
          </a>
        </>
      )}
    </div>
  )
}

// The price card on the right of the hero: the same facts as the bundle's
// card on the homepage.
function PriceCard({ b }) {
  return (
    <div className="relative rounded-3xl border border-white/15 bg-ink/70 backdrop-blur-md p-7 md:p-9 flex flex-col gap-6 shadow-2xl shadow-black/60">
      <span className="absolute -top-3 left-7 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-brand text-ink">
        {b.comingSoon ? 'Coming soon' : b.featured ? 'Best value' : 'Bundle'}
      </span>
      <div>
        <p className="font-display font-bold text-2xl md:text-3xl">{b.name}</p>
        <p className="text-text-secondary mt-1">{b.tagline}</p>
      </div>
      <div>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display font-bold text-5xl md:text-6xl">{b.price}</span>
          <span className="text-text-secondary">{b.unit}</span>
        </p>
        <p className="text-sm text-text-secondary mt-2">{b.note}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {b.points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-text-secondary">
            <Check />
            {p}
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-tertiary">Prices in Canadian dollars. Taxes extra where applicable.</p>
    </div>
  )
}

function Hero({ b, page }) {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
      {/* The same moving light as the homepage hero. */}
      <BackgroundVideo name="hero" tint="bg-ink/40" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center">
        <m.div
          key={b.slug}
          initial={{ y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6"
        >
          <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">{page.kicker}</span>
          <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
            <Headline text={page.headline} accent={page.accent} />
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance">{page.intro}</p>
          <BundleButtons b={b} />
        </m.div>
        <m.div
          key={`${b.slug}-card`}
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl mx-auto lg:max-w-none"
        >
          <PriceCard b={b} />
        </m.div>
      </div>
    </section>
  )
}

// What it costs: each part on its own and in the bundle.
function Savings({ s }) {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal className="mb-10">
          <Eyebrow>What it costs</Eyebrow>
          <Heading>Clear prices, before you sign.</Heading>
        </Reveal>
        <Reveal delay={0.08} className="rounded-3xl border border-border bg-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.3fr_1fr_1fr] gap-6 px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-tertiary border-b border-border">
            <span>What</span>
            <span>On its own</span>
            <span>In this bundle</span>
          </div>
          {s.rows.map((r) => (
            <div
              key={r.item}
              className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-1 md:gap-6 px-6 md:px-8 py-5 border-b border-border last:border-b-0"
            >
              <span className="font-display font-bold text-lg">{r.item}</span>
              <span className="text-text-secondary">
                {r.alone && (
                  <>
                    <span className="md:hidden text-text-tertiary">On its own: </span>
                    {r.alone}
                  </>
                )}
              </span>
              <span className="font-bold text-text">
                <span className="md:hidden font-normal text-text-tertiary">In this bundle: </span>
                {r.bundle}
              </span>
            </div>
          ))}
        </Reveal>
        <Reveal delay={0.12}>
          <p className="text-text-secondary leading-relaxed max-w-4xl mt-6">{s.note}</p>
          <p className="text-sm text-text-tertiary mt-3">Prices in Canadian dollars. Taxes extra where applicable.</p>
        </Reveal>
      </div>
    </section>
  )
}

function Faq({ b, items }) {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal className="mb-10">
          <Eyebrow>Common questions</Eyebrow>
          <Heading>Questions about the {b.name}.</Heading>
        </Reveal>
        <div className="flex flex-col">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04} y={16}>
              <details className="group border-b border-border py-6">
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none font-display font-semibold text-xl md:text-2xl [&::-webkit-details-marker]:hidden">
                  {f.title}
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-lg transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-text-secondary text-lg leading-relaxed mt-4">{f.body}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// The other bundles and the services, so every bundle page links to the rest.
function Explore({ b, next }) {
  const others = BUNDLES.filter((o) => o.slug !== b.slug)
  const nextBundle = next && getBundle(next.slug)
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal className="mb-10">
          <Eyebrow>Compare bundles</Eyebrow>
          <Heading>Not sure this is the right fit?</Heading>
          {nextBundle && (
            <p className="text-lg text-text-secondary leading-relaxed max-w-3xl mt-5">
              {next.text}{' '}
              <Link to={bundlePath(nextBundle)} className="font-bold text-text underline decoration-blue underline-offset-4">
                See the {nextBundle.name}
              </Link>
              .
            </p>
          )}
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {others.map((o, i) => (
            <Reveal key={o.slug} delay={i * 0.08}>
              <Link
                to={bundlePath(o)}
                className="group flex flex-col gap-3 h-full rounded-3xl border border-border bg-surface p-7 hover:border-blue transition-colors"
              >
                <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
                  {o.comingSoon ? 'Coming soon' : o.tagline}
                </span>
                <span className="font-display font-bold text-2xl">{o.name}</span>
                <span className="text-text-secondary leading-relaxed flex-1">{o.menu}</span>
                <span className="inline-flex items-center gap-2 text-sm font-bold">
                  Learn more
                  <Arrow />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest w-full">Or pick one service</span>
          {SERVICES.map((s) => (
            <Link key={s.slug} to={servicePath(s)} className="group inline-flex items-center gap-2 text-sm font-bold text-text">
              {s.name}
              <Arrow />
            </Link>
          ))}
          <Link to={BOOKS.path} className="group inline-flex items-center gap-2 text-sm font-bold text-text">
            {BOOKS.name}
            <Arrow />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function CTA({ b, cta }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 border-t border-border">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[640px] rounded-full opacity-20 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-blue)_50%,var(--color-orange)),transparent)]" />
      <Reveal className="relative max-w-3xl mx-auto px-6 md:px-10 flex flex-col items-center text-center gap-6">
        <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] text-balance">{cta.heading}</h2>
        <p className="text-lg md:text-xl text-text-secondary">{cta.body}</p>
        <BundleButtons b={b} center />
      </Reveal>
    </section>
  )
}

// One bundle page, e.g. /bundles/grow-bundle. Content lives in lib/bundlePages.js.
export default function Bundle() {
  const { slug } = useParams()
  const b = getBundle(slug)
  const page = BUNDLE_PAGES[slug]

  usePageMeta(b?.metaTitle, b?.metaDescription)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!b || !page) return <Navigate to="/#bundles" replace />

  // Guides for this bundle, once they are published.
  const reading = page.reading.map((s) => articles.find((a) => a.slug === s)).filter(Boolean)
  const readingSection = {
    type: 'cards',
    eyebrow: 'Helpful reading',
    heading: 'Free guides for small business owners.',
    items: reading.map((a) => ({ title: a.title, body: a.description, link: { to: `/articles/${a.slug}`, label: 'Read the guide' } })),
    link: { to: '/articles', label: 'All articles' },
  }

  return (
    <>
      <Hero b={b} page={page} />
      <PageSections sections={page.sections} />
      <Savings s={page.savings} />
      <Faq b={b} items={page.faq} />
      {reading.length > 0 && <PageSections sections={[readingSection]} />}
      <Explore b={b} next={page.next} />
      <CTA b={b} cta={page.cta} />
    </>
  )
}
