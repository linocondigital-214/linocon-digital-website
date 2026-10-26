import { useEffect, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const img = (name) => `${import.meta.env.BASE_URL}images/${name}`

// The four frames of the hero visual, in the order the story is told.
const STORY = [
  { key: 'web', label: 'Website', alt: 'A custom business website shown on a laptop and a phone' },
  { key: 'seo', label: 'SEO', alt: 'The business website showing up in Google search results' },
  { key: 'links', label: 'Backlinks', alt: 'Relevant blogs, directories and news sites linking to the website' },
  { key: 'growth', label: 'Growth', alt: 'Website to Google to visitors to enquiries to business growth' },
]

const STEP_MS = 4500

function StoryImage({ s, active }) {
  return (
    <img
      src={img(`story-${s.key}-960.webp`)}
      srcSet={`${img(`story-${s.key}-640.webp`)} 640w, ${img(`story-${s.key}-960.webp`)} 960w, ${img(`story-${s.key}-1440.webp`)} 1440w`}
      sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, (min-width: 768px) 720px, 100vw"
      width="1440"
      height="810"
      alt={s.alt}
      aria-hidden={!active}
      decoding="async"
      className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-700 ease-out ${
        active ? 'opacity-100 scale-100' : 'opacity-0 motion-safe:scale-[1.03]'
      }`}
    />
  )
}

// Website → SEO → Backlinks → Growth. Only the first frame loads up front (it
// is the page's largest image); the other three are added once it has loaded,
// so they never compete with the headline or the first frame for bandwidth.
function GrowthStory() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [rest, setRest] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduce || !rest) return
    const id = setTimeout(() => setActive((a) => (a + 1) % STORY.length), STEP_MS)
    return () => clearTimeout(id)
  }, [active, reduce, rest, tick])

  const pick = (i) => {
    setActive(i)
    setTick((t) => t + 1)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-surface shadow-2xl shadow-black/60">
        <img
          src={img('story-web-960.webp')}
          srcSet={`${img('story-web-640.webp')} 640w, ${img('story-web-960.webp')} 960w, ${img('story-web-1440.webp')} 1440w`}
          sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, (min-width: 768px) 720px, 100vw"
          width="1440"
          height="810"
          alt={STORY[0].alt}
          aria-hidden={active !== 0}
          fetchPriority="high"
          onLoad={() => setRest(true)}
          ref={(el) => {
            if (el?.complete && el.naturalWidth) setRest(true)
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-700 ease-out ${
            active === 0 ? 'opacity-100 scale-100' : 'opacity-0 motion-safe:scale-[1.03]'
          }`}
        />
        {rest && STORY.slice(1).map((s, i) => <StoryImage key={s.key} s={s} active={active === i + 1} />)}
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-3" role="group" aria-label="Show a step">
        {STORY.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => pick(i)}
            aria-pressed={active === i}
            className="group flex flex-col gap-2 text-left"
          >
            <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
              <span
                key={active === i ? `on-${tick}` : 'off'}
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-brand ${
                  active === i ? (reduce || !rest ? 'w-full' : 'story-progress') : i < active ? 'w-full opacity-40' : 'w-0'
                }`}
                style={active === i && !reduce && rest ? { animationDuration: `${STEP_MS}ms` } : undefined}
              />
            </span>
            <span
              className={`text-xs md:text-sm font-bold transition-colors ${
                active === i ? 'text-text' : 'text-text-tertiary group-hover:text-text-secondary'
              }`}
            >
              <span className="hidden sm:inline">0{i + 1} </span>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Desktop: a stable headline and copy on the left, the growth story playing
// on the right. Phones and tablets get one column: headline, copy and buttons
// first, then the visual underneath.
export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
      {/* Soft glows drawn as radial gradients rather than blur() filters:
          same look, but a big blur is slow for phone GPUs to repaint. */}
      <div className="pointer-events-none absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full opacity-20 bg-[radial-gradient(closest-side,var(--color-blue),transparent)]" />
      <div className="pointer-events-none absolute -top-12 -right-72 w-[880px] h-[880px] rounded-full opacity-15 bg-[radial-gradient(closest-side,var(--color-orange),transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-[45fr_55fr] gap-12 lg:gap-14 items-center">
        {/* Slide only, no fade: the headline is the page's largest text, and
            starting it at opacity 0 kept it invisible to visitors (and to
            Google's "largest paint" timing) until the animation finished. */}
        <m.div
          initial={{ y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 md:gap-7 max-w-2xl mx-auto lg:mx-0"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-orange" />
            <span className="text-xs font-bold tracking-widest text-text-secondary uppercase">
              Websites &bull; SEO &bull; Backlinks
            </span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl xl:text-[5.25rem] leading-[1.02]">
            Get found.
            <br />
            Get chosen.
            <br />
            Get <span className="text-gradient">growing.</span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance">
            We build fast websites that turn visitors into enquiries, then get them found on
            Google with proper SEO and backlinks. One team, one system, no guesswork.
          </p>

          {/* The free audit is the main button: it's an easier first step than
              booking a call for visitors who are still deciding. */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <a
              href="#audit"
              className="flex items-center justify-center h-14 px-7 rounded-full bg-gradient-brand text-ink text-base font-bold"
            >
              Get your free audit
            </a>
            <Link
              to="/book"
              className="flex items-center justify-center h-14 px-7 rounded-full border border-white/20 text-base font-bold hover:bg-white/5 transition-colors"
            >
              Book a strategy call
            </Link>
          </div>

          <p className="text-sm text-text-secondary text-balance">
            Based in Vancouver, BC. Working with small businesses across Canada and the US.
          </p>
        </m.div>

        <div className="w-full max-w-3xl mx-auto lg:max-w-none">
          <GrowthStory />
        </div>
      </div>
    </section>
  )
}
