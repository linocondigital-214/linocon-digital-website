import { useRef, useState } from 'react'
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
  useReducedMotion,
} from 'framer-motion'
import Reveal from '../Reveal'
import useMediaQuery from '../../lib/useMediaQuery'
import { Link } from 'react-router-dom'
import { ServiceImage } from '../visuals'
import { SERVICES as CORE_SERVICES, servicePath } from '../../lib/services'
import { BOOKS_SERVICE } from '../../lib/books'

// The three services, plus LinoCon Books (coming soon) as the fourth.
const SERVICES = [...CORE_SERVICES, BOOKS_SERVICE]

const hrefFor = (s) => s.href || servicePath(s)

// A filled brand button, so the way into each service page is hard to miss.
function LearnMore({ s }) {
  return (
    <Link
      to={hrefFor(s)}
      className="group inline-flex items-center justify-center gap-2.5 h-13 px-7 mt-3 rounded-full bg-gradient-brand text-ink text-base font-bold shadow-lg shadow-blue/20 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/25"
    >
      {s.cta || `Explore ${s.name}`}
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
        <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

// The illustration links to the service page too.
function ImageLink({ s }) {
  return (
    <Link
      to={hrefFor(s)}
      aria-label={s.cta ? `${s.name}: ${s.cta}` : `Explore ${s.name}`}
      tabIndex={-1}
      className="flex justify-center transition-transform duration-500 hover:-translate-y-1"
    >
      <ServiceImage name={s.image} alt={s.alt} />
    </Link>
  )
}

function Kicker({ s }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">{s.kicker}</span>
      {s.comingSoon && (
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-brand text-ink whitespace-nowrap">
          Coming soon
        </span>
      )}
    </span>
  )
}

function Points({ points }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {points.map((p) => (
        <li key={p} className="flex items-center gap-3 text-text-secondary">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <circle cx="9" cy="9" r="9" fill="#2E6BFF" fillOpacity="0.18" />
            <path d="M5.5 9.2l2.2 2.2 4.8-4.8" stroke="#2E6BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {p}
        </li>
      ))}
    </ul>
  )
}

// Desktop: the section pins and the copy and illustration swap as you scroll,
// one service per screen of scrolling.
function StickyStory() {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(SERVICES.length - 1, Math.floor(v * SERVICES.length)))
  })

  const s = SERVICES[active]

  return (
    <div ref={ref} className="relative" style={{ height: `${SERVICES.length * 100}vh` }}>
      <div className="sticky top-0 h-svh flex items-center">
        <div className="max-w-6xl w-full mx-auto px-10 grid grid-cols-[1fr_1fr] gap-16 items-center">
          <div className="flex gap-10">
            <div className="flex flex-col gap-3 pt-2">
              {SERVICES.map((_, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-500 ${
                    i === active ? 'h-12 bg-gradient-brand' : 'h-6 bg-white/15'
                  }`}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <m.div
                key={active}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-start gap-5"
              >
                <Kicker s={s} />
                <h3 className="font-display font-bold text-4xl lg:text-5xl leading-tight">{s.title}</h3>
                <p className="text-lg text-text-secondary leading-relaxed max-w-md">{s.body}</p>
                <Points points={s.points} />
                <LearnMore s={s} />
              </m.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <m.div
              key={active}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <ImageLink s={s} />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Stacked() {
  return SERVICES.map((s) => (
    <div key={s.title} className="max-w-6xl mx-auto px-6 flex flex-col gap-10 py-20 border-t border-border">
      <Reveal className="flex flex-col items-start gap-5">
        <Kicker s={s} />
        <h3 className="font-display font-bold text-3xl leading-tight">{s.title}</h3>
        <p className="text-lg text-text-secondary leading-relaxed">{s.body}</p>
        <Points points={s.points} />
        <LearnMore s={s} />
      </Reveal>
      <Reveal className="flex justify-center" delay={0.1}>
        <ImageLink s={s} />
      </Reveal>
    </div>
  ))
}

export default function Services() {
  const reduce = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <section id="services" className="pt-28 md:pt-36">
      <Reveal className="max-w-6xl mx-auto px-6 md:px-10 pb-16 md:pb-8">
        <span className="text-sm font-bold tracking-widest uppercase text-orange">What we do</span>
        <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight max-w-3xl mt-4">
          Four services. One growth system.
        </h2>
      </Reveal>
      {reduce || !isDesktop ? <Stacked /> : <StickyStory />}
    </section>
  )
}
