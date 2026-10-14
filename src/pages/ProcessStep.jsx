import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { m } from 'framer-motion'
import Reveal from '../components/Reveal'
import { Arrow, Eyebrow, Heading, PageCTA, PageHero, PageSections } from '../components/PageSections'
import { PROCESS_STEPS, getStep, stepPath } from '../lib/process'
import { PROCESS_PAGES } from '../lib/processPages'
import usePageMeta from '../lib/usePageMeta'

export default function ProcessStep() {
  const { slug } = useParams()
  const s = getStep(slug)
  const page = s?.hasPage ? PROCESS_PAGES[slug] : null

  usePageMeta(page?.metaTitle, page?.metaDescription)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!page) return <Navigate to="/#process" replace />

  const i = PROCESS_STEPS.indexOf(s)
  const prev = PROCESS_STEPS[i - 1]
  const next = PROCESS_STEPS[i + 1]

  return (
    <>
      <PageHero id={s.slug} kicker={`Step ${s.n} — ${s.name}`} page={page} />
      <PageSections sections={page.sections} />

      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Reveal className="flex flex-col gap-4">
            <Eyebrow>The full process</Eyebrow>
            <Heading compact>Four steps, so you always know what comes next.</Heading>
          </Reveal>
          <Reveal delay={0.1} as={m.ol} className="flex flex-col gap-3">
            {PROCESS_STEPS.map((st) => {
              const current = st.slug === s.slug
              const inner = (
                <>
                  <span className="flex items-center gap-4">
                    <span className={`font-display font-bold text-lg ${current ? 'text-gradient' : 'text-text-tertiary'}`}>
                      {st.n}
                    </span>
                    <span className="font-display font-bold text-xl">{st.name}</span>
                  </span>
                  {current ? (
                    <span className="text-xs font-bold tracking-widest uppercase text-orange">You are here</span>
                  ) : (
                    st.hasPage && <Arrow />
                  )}
                </>
              )
              const cls = `group flex items-center justify-between gap-6 rounded-2xl border bg-surface px-6 py-5 ${
                current ? 'border-blue' : 'border-border'
              }`
              return (
                <li key={st.slug}>
                  {!current && st.hasPage ? (
                    <Link to={stepPath(st)} className={`${cls} hover:border-blue transition-colors`}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={cls} aria-current={current ? 'step' : undefined}>
                      {inner}
                    </div>
                  )}
                </li>
              )
            })}
          </Reveal>
        </div>
        {(prev?.hasPage || next?.hasPage) && (
          <div className="max-w-6xl mx-auto px-6 md:px-10 mt-10 flex justify-between gap-4">
            {prev?.hasPage ? (
              <Link to={stepPath(prev)} className="text-sm font-bold text-text-secondary hover:text-text">
                &larr; {prev.name}
              </Link>
            ) : (
              <span />
            )}
            {next?.hasPage && (
              <Link to={stepPath(next)} className="text-sm font-bold text-text-secondary hover:text-text">
                Next: {next.name} &rarr;
              </Link>
            )}
          </div>
        )}
      </section>

      <PageCTA cta={page.cta} />
    </>
  )
}
