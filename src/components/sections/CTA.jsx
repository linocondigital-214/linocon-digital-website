import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { m, useScroll, useReducedMotion } from 'framer-motion'
import { useScrollRange } from '../../lib/scroll'
import { CONTACT_EMAIL } from '../../lib/leads'

export default function CTA() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scale = useScrollRange(scrollYProgress, [0, 1], [0.85, 1])
  const opacity = useScrollRange(scrollYProgress, [0, 0.6], [0, 1])

  return (
    <section id="contact" ref={ref} className="relative flex items-center border-t border-border overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1180px] h-[780px] rounded-full opacity-25 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-blue)_50%,var(--color-orange)),transparent)]" />
      <m.div
        style={reduce ? undefined : { scale, opacity }}
        className="relative max-w-6xl mx-auto px-6 md:px-10 flex flex-col items-center text-center gap-8"
      >
        <h2 className="font-display font-bold text-5xl md:text-8xl leading-[1.02] max-w-4xl text-balance">
          Ready for a website that brings in <span className="text-gradient">customers?</span>
        </h2>
        <p className="text-lg md:text-xl text-text-secondary max-w-xl">
          Book a free strategy call and we&#39;ll show you exactly where the leverage is.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/book"
            className="flex items-center h-14 px-8 rounded-full bg-gradient-brand text-ink text-base font-bold"
          >
            Book a free strategy call
          </Link>
          <a
            href="#audit"
            className="flex items-center h-14 px-8 rounded-full border border-white/20 text-base font-bold hover:bg-white/5 transition-colors"
          >
            Get a free audit
          </a>
        </div>
        <p className="text-base text-text-secondary">
          Prefer email? Write to us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-text underline underline-offset-4 whitespace-nowrap">
            {CONTACT_EMAIL}
          </a>
        </p>
      </m.div>
    </section>
  )
}
