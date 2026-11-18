import { useRef } from 'react'
import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useScrollRange } from '../lib/scroll'

// The "stage" each service illustration sits on in the homepage "What we
// do" section: a slowly turning glow in that service's colours, an orbit
// with a travelling spark, and the service's own points floating around the
// picture as little cards.
// - Desktop: the picture tilts towards the pointer, with a soft shine.
// - Phones: the picture tilts up into place as it scrolls into view.
// Only transforms and opacity animate (cheap for phones), and everything
// stays still for visitors who ask for less motion.

const AURA = {
  web: ['#2e6bff', '#7b5cff', '#2e6bff'],
  seo: ['#2e6bff', '#22c3a6', '#2e6bff'],
  links: ['#7b5cff', '#ff6a3d', '#7b5cff'],
  books: ['#ff6a3d', '#2e6bff', '#ff6a3d'],
}

// Where the point cards float, as a share of the stage (phone-safe insets).
const SPOTS = [
  'top-0 left-0 md:top-[2%] md:-left-10',
  'bottom-0 right-0 md:bottom-auto md:top-[40%] md:-right-12',
  'hidden md:block md:bottom-[3%] md:left-[4%]',
]

function Chip({ text, index, still }) {
  return (
    <m.div
      initial={still ? false : { opacity: 0, y: 16, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: 0.25 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-20 ${SPOTS[index]}`}
    >
      <div
        className={`${still ? '' : 'stage-float'} flex items-center gap-2 rounded-full border border-white/15 bg-surface-2/90 pl-2 pr-3.5 py-1.5 md:py-2 shadow-lg shadow-black/40 text-[11px] sm:text-xs md:text-sm font-bold text-text md:whitespace-nowrap max-w-[78vw] md:max-w-none`}
        style={{ animationDelay: `${index * -1.3}s` }}
      >
        <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-brand text-ink">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6.2l2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {text}
      </div>
    </m.div>
  )
}

export default function ServiceStage({ s, desktop, children }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [a, b, c] = AURA[s.image] ?? AURA.web

  // Desktop: tilt towards the pointer.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 140, damping: 18 })
  const sy = useSpring(py, { stiffness: 140, damping: 18 })
  const rotY = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const rotX = useTransform(sy, [-0.5, 0.5], [8, -8])
  const shineX = useTransform(sx, [-0.5, 0.5], ['20%', '80%'])
  const shineY = useTransform(sy, [-0.5, 0.5], ['15%', '85%'])
  const shine = useTransform([shineX, shineY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.16), transparent 55%)`)

  // Phones: rise and tilt into place while scrolling in.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const inRotX = useScrollRange(scrollYProgress, [0, 1], [24, 0])
  const inScale = useScrollRange(scrollYProgress, [0, 1], [0.86, 1])

  const tiltOnPointer = desktop && !reduce
  const tiltOnScroll = !desktop && !reduce

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      ref={ref}
      className="relative w-full max-w-lg mx-auto py-12 md:py-8"
      style={{ perspective: 1200 }}
      onPointerMove={tiltOnPointer ? onMove : undefined}
      onPointerLeave={tiltOnPointer ? onLeave : undefined}
    >
      {/* Turning glow in the service's colours. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-[-12%] flex items-center justify-center">
        <div
          className={`${reduce ? '' : 'stage-spin'} w-full aspect-square rounded-full opacity-45`}
          style={{
            background: `conic-gradient(from 0deg, ${a}, transparent 30%, ${b} 50%, transparent 75%, ${c})`,
            maskImage: 'radial-gradient(closest-side, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(closest-side, black 20%, transparent 100%)',
          }}
        />
      </div>

      {/* Orbit with a travelling spark. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-[-2%] md:inset-[-6%] flex items-center justify-center">
        <div className="relative w-full aspect-square rounded-full border border-white/[0.07]">
          <div className={`${reduce ? '' : 'stage-orbit'} absolute inset-0`}>
            <span
              className="absolute left-1/2 -top-1 w-2 h-2 -ml-1 rounded-full bg-white"
              style={{ boxShadow: `0 0 12px 3px ${b}, 0 0 28px 8px ${a}66` }}
            />
          </div>
        </div>
      </div>

      <m.div
        style={
          tiltOnPointer
            ? { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }
            : tiltOnScroll
              ? { rotateX: inRotX, scale: inScale }
              : undefined
        }
        className="relative z-10"
      >
        {children}
        {tiltOnPointer && (
          <m.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl mix-blend-soft-light" style={{ background: shine }} />
        )}
      </m.div>

      {s.points.slice(0, 3).map((p, i) => (
        <Chip key={p} text={p} index={i} still={reduce} />
      ))}
    </div>
  )
}
