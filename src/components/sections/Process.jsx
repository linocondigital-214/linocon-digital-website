import { useLayoutEffect, useRef, useState } from 'react'
import { m, useScroll, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollRange } from '../../lib/scroll'
import Reveal from '../Reveal'
import BackgroundVideo from '../BackgroundVideo'
import useMediaQuery from '../../lib/useMediaQuery'
import { PROCESS_STEPS as STEPS, stepPath } from '../../lib/process'

// Same gradient button as the "Explore" buttons in the Services section.
function LearnMore({ s }) {
  return (
    <Link
      to={stepPath(s)}
      aria-label={`Learn more about the ${s.name} step`}
      className="group self-start inline-flex items-center justify-center gap-2.5 h-12 px-6 mt-auto rounded-full bg-gradient-brand text-ink text-base font-bold shadow-lg shadow-blue/20 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/25"
    >
      Learn more
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
        <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

function StepCard({ s }) {
  return (
    <div className="relative isolate overflow-hidden flex flex-col gap-5 rounded-3xl bg-surface border border-border p-8 md:p-10 min-h-[440px] md:min-h-0 md:w-[min(520px,40vw)] md:h-[420px] shrink-0">
      {/* A short looping video of the step (lazy: loads when scrolled near). */}
      <BackgroundVideo
        name={s.image}
        lazy
        tint=""
        fadeTop={false}
        fadeBottom={false}
        big={1040}
        small={600}
        posterBig={1040}
        posterSmall={600}
        className="-z-20"
      />
      {/* Dark fade so the text stays readable: heaviest behind the text at
          the top left, lighter where the video's subject sits bottom right. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,11,16,0.55) 0%, rgba(11,11,16,0.3) 50%, rgba(11,11,16,0) 100%), linear-gradient(90deg, rgba(11,11,16,0.45) 0%, rgba(11,11,16,0) 60%)',
        }}
      />
      <div className="h-[3px] w-16 rounded-full bg-gradient-brand" />
      <span className="font-display font-bold text-6xl md:text-7xl text-white/25">{s.n}</span>
      <h3 className="font-display font-bold text-2xl md:text-3xl">{s.name}</h3>
      <p className="text-text leading-relaxed md:text-lg max-w-[34ch]">{s.body}</p>
      {s.hasPage && <LearnMore s={s} />}
    </div>
  )
}

function Heading() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-10 items-end pb-12 md:pb-14 w-full">
      <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">
        A system,
        <br />
        not a scramble.
      </h2>
      <p className="text-lg text-text-secondary leading-relaxed">
        Every project runs the same four steps, so you always know what&#39;s happening and what
        comes next.
      </p>
    </div>
  )
}

// Desktop: vertical scrolling slides the steps sideways while the section
// stays pinned.
function HorizontalTrack() {
  const ref = useRef(null)
  const trackRef = useRef(null)
  const [distance, setDistance] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useScrollRange(scrollYProgress, [0.05, 0.95], [0, -distance])

  useLayoutEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-svh flex flex-col justify-center overflow-hidden">
        <Heading />
        <m.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 w-max pl-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))] pr-10"
        >
          {STEPS.map((s) => (
            <StepCard key={s.n} s={s} />
          ))}
        </m.div>
      </div>
    </div>
  )
}

export default function Process() {
  const reduce = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <section id="process" className="border-t border-border">
      {reduce || !isDesktop ? (
        <div className="py-28">
          <Reveal>
            <Heading />
          </Reveal>
          <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <StepCard s={s} />
              </Reveal>
            ))}
          </div>
        </div>
      ) : (
        <HorizontalTrack />
      )}
    </section>
  )
}
