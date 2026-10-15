import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Bundles from '../components/sections/Bundles'
import { Arrow, Eyebrow, Heading, PageCTA, PageHero, PageSections } from '../components/PageSections'
import { SERVICES, getService, servicePath } from '../lib/services'
import { SERVICE_PAGES } from '../lib/servicePages'
import { getArticle } from '../lib/articles'
import usePageMeta from '../lib/usePageMeta'

export default function Service() {
  const { slug } = useParams()
  const s = getService(slug)
  const page = SERVICE_PAGES[slug]

  usePageMeta(s?.metaTitle, s?.metaDescription)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!s || !page) return <Navigate to="/#services" replace />

  const others = SERVICES.filter((o) => o.slug !== s.slug)
  const article = s.article && getArticle(s.article)

  return (
    <>
      <PageHero id={s.slug} kicker={s.kicker} page={page} />
      <PageSections sections={page.sections} />
      <Bundles />

      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Reveal className="flex flex-col gap-4">
            <Eyebrow>Explore more</Eyebrow>
            <Heading compact>The services work even better together.</Heading>
            {article && (
              <Link
                to={`/articles/${article.slug}`}
                className="group inline-flex items-center gap-2 text-sm font-bold text-text mt-2"
              >
                Read: {article.title}
                <Arrow />
              </Link>
            )}
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-4">
            {others.map((o) => (
              <Link
                key={o.slug}
                to={servicePath(o)}
                className="group flex items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-6 md:p-7 hover:border-blue transition-colors"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="font-display font-bold text-xl">{o.name}</span>
                  <span className="text-text-secondary">{o.menu}</span>
                </div>
                <Arrow />
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <PageCTA cta={page.cta} />
    </>
  )
}
