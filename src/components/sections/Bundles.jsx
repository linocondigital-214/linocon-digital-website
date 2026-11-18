import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { BUNDLES, bundlePath } from '../../lib/bundles'

// Founding-client bundles: the data (shared with each bundle's own page and
// the footer) lives in lib/bundles.js.
const CARDS = BUNDLES.filter((b) => !b.comingSoon)
const COMPLETE = BUNDLES.find((b) => b.comingSoon)

// "Learn more" opens the bundle's own page.
function LearnMore({ b }) {
  return (
    <Link to={bundlePath(b)} className="group inline-flex items-center gap-2 text-sm font-bold text-text">
      Learn more<span className="sr-only"> about the {b.name}</span>
      <Arrow />
    </Link>
  )
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

// LinoCon Complete: everything plus LinoCon Books. Coming soon, so it links
// to the Books waitlist instead of a payment.
function Complete() {
  const b = COMPLETE
  return (
    <Reveal
      y={40}
      className="relative mt-8 rounded-3xl border border-white/15 bg-gradient-to-br from-surface-2 via-surface to-blue/15 p-7 md:p-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center"
    >
      <span className="absolute -top-3 left-7 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-brand text-ink">
        Coming soon
      </span>
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="font-display font-bold text-2xl md:text-3xl">{b.name}</h3>
          <p className="text-text-secondary mt-1">Everything your business needs online, plus your own books.</p>
        </div>
        <div>
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display font-bold text-4xl md:text-5xl">{b.price}</span>
            <span className="text-text-secondary">{b.unit}</span>
          </p>
          <p className="text-sm text-text-secondary mt-2">{b.note}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Link
            to="/books#waitlist"
            className="flex items-center justify-center h-13 px-6 rounded-full border border-white/20 hover:bg-white/5 transition-colors text-base font-bold w-full sm:w-fit"
          >
            Join the waitlist
          </Link>
          <div className="text-center sm:text-left">
            <LearnMore b={b} />
          </div>
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-3">
        {b.points.map((p) => (
          <li key={p} className="flex items-start gap-3 rounded-2xl border border-border bg-ink/40 px-5 py-4 text-text-secondary leading-snug">
            <Check />
            {p}
          </li>
        ))}
      </ul>
    </Reveal>
  )
}

export default function Bundles() {
  return (
    <section id="bundles" className="py-28 md:py-36 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal className="mb-14">
          <span className="text-sm font-bold tracking-widest uppercase text-orange">Bundles</span>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight max-w-3xl mt-4">
            Better together. <span className="text-gradient">Better value.</span>
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mt-5">
            Founding-client prices for our first clients. Pick a bundle, or mix the services to fit your business.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {CARDS.map((b, i) => (
            <Reveal
              key={b.name}
              delay={i * 0.08}
              y={40}
              className={`relative rounded-3xl border p-7 md:p-8 flex flex-col gap-6 ${
                b.featured ? 'border-blue bg-gradient-to-br from-blue/20 via-surface to-orange/15' : 'border-border bg-surface'
              }`}
            >
              {b.featured && (
                <span className="absolute -top-3 left-7 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-brand text-ink">
                  Best value
                </span>
              )}
              <div>
                <h3 className="font-display font-bold text-2xl md:text-3xl">{b.name}</h3>
                <p className="text-text-secondary mt-1">{b.tagline}</p>
              </div>
              <div>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display font-bold text-4xl md:text-5xl">{b.price}</span>
                  <span className="text-text-secondary">{b.unit}</span>
                </p>
                <p className="text-sm text-text-secondary mt-2">{b.note}</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {b.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-text-secondary">
                    <Check />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <Link
                  to="/book"
                  className={`flex items-center justify-center h-13 px-6 rounded-full text-base font-bold ${
                    b.featured ? 'bg-gradient-brand text-ink!' : 'border border-white/20 hover:bg-white/5 transition-colors'
                  }`}
                >
                  Book a strategy call
                </Link>
                <div className="text-center">
                  <LearnMore b={b} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Complete />

        <p className="text-sm text-text-secondary pt-8">Prices in Canadian dollars. Taxes extra where applicable.</p>
      </div>
    </section>
  )
}
