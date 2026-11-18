import { useRef } from 'react'
import { m, useScroll, useReducedMotion } from 'framer-motion'
import { useScrollRange } from '../../lib/scroll'
import BackgroundVideo from '../BackgroundVideo'

const TEXT =
  'Most small business websites look fine and sell nothing. Nobody finds them on Google, and the few who do leave without calling. We fix both.'

function Word({ children, progress, range, highlight }) {
  const opacity = useScrollRange(progress, range, [0.15, 1])
  return (
    <m.span style={{ opacity }} className={highlight ? 'text-gradient' : undefined}>
      {children}{' '}
    </m.span>
  )
}

// Words light up one by one as you scroll through the pinned section.
export default function Statement() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const words = TEXT.split(' ')
  const highlightFrom = words.length - 3

  return (
    <section ref={ref} className={reduce ? 'py-32' : 'relative h-[200vh]'}>
      <div className={`${reduce ? '' : 'sticky top-0 h-svh'} relative flex items-center overflow-hidden`}>
        {/* Grey dots (sites nobody finds) that light up one by one. */}
        <BackgroundVideo name="found" lazy tint="bg-ink/10" />
        <p className="relative max-w-5xl mx-auto px-6 md:px-10 font-display font-bold text-3xl sm:text-4xl md:text-6xl leading-[1.15] tracking-tight">
          {words.map((w, i) =>
            reduce ? (
              <span key={i} className={i >= highlightFrom ? 'text-gradient' : undefined}>
                {w}{' '}
              </span>
            ) : (
              <Word
                key={i}
                progress={scrollYProgress}
                range={[0.1 + (i / words.length) * 0.75, 0.1 + ((i + 1) / words.length) * 0.75]}
                highlight={i >= highlightFrom}
              >
                {w}
              </Word>
            ),
          )}
        </p>
      </div>
    </section>
  )
}
