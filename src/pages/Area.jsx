import { useEffect } from 'react'
import { m } from 'framer-motion'
import { Buttons, Headline, PageCTA, PageSections } from '../components/PageSections'
import usePageMeta from '../lib/usePageMeta'
import { AREAS, areaPath } from '../lib/areaPages'
import { SERVICES, servicePath } from '../lib/services'

// One city page, e.g. /web-design-burnaby. Content lives in lib/areaPages.js.
export default function Area({ area }) {
  usePageMeta(area.metaTitle, area.metaDescription)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [area.slug])

  const others = AREAS.filter((a) => a.slug !== area.slug)

  const sections = [
    {
      type: 'text',
      eyebrow: `Local SEO in ${area.city}`,
      heading: area.local.heading,
      body: area.local.body,
      link: { to: '/services/seo-setup', label: 'See SEO Setup' },
    },
    {
      type: 'cards',
      eyebrow: 'What we do',
      heading: `Three services for ${area.city} businesses.`,
      intro: 'Pick one, or combine them so your website, your SEO and your links all work together.',
      items: SERVICES.map((s) => ({ title: s.name, body: s.body, link: { to: servicePath(s), label: `About ${s.name}` } })),
    },
    {
      type: 'checklist',
      eyebrow: 'Who we help',
      heading: `Small businesses across ${area.city}.`,
      intro: 'You don’t need to know anything about websites or SEO. We explain everything in plain words.',
      items: area.who,
    },
    {
      type: 'process',
      eyebrow: 'How it works',
      heading: 'Four simple steps, all online.',
      steps: [
        { title: 'Free call', body: 'We look at your business, your area and how you show up on Google today.' },
        { title: 'A clear plan', body: 'You get a written plan and quote. If you go ahead, you sign online.' },
        { title: 'Build and launch', body: 'You follow your project on your own client page and approve each step.' },
        { title: 'Grow', body: 'We keep improving your SEO and send you updates by email.' },
      ],
    },
    {
      type: 'cards',
      eyebrow: 'Common questions',
      heading: `Questions from ${area.city} business owners.`,
      items: area.faq,
    },
    {
      type: 'cards',
      eyebrow: 'Other areas we serve',
      heading: 'Also working across Metro Vancouver.',
      intro: 'And remotely with small businesses anywhere in Canada and the US.',
      items: others.map((a) => ({
        title: a.city,
        body: `Website design and SEO for small businesses in ${a.city}.`,
        link: { to: areaPath(a), label: `Web design in ${a.city}` },
      })),
      link: { to: '/who-we-work-with', label: 'Who we work with' },
    },
  ]

  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
        <div className="pointer-events-none absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full opacity-20 bg-[radial-gradient(closest-side,var(--color-blue),transparent)]" />
        <div className="pointer-events-none absolute -top-12 -right-72 w-[880px] h-[880px] rounded-full opacity-15 bg-[radial-gradient(closest-side,var(--color-orange),transparent)]" />
        <m.div
          key={area.slug}
          initial={{ y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto px-6 md:px-10 flex flex-col items-center text-center gap-6"
        >
          <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">
            Web design in {area.city}, BC
          </span>
          <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
            <Headline text={area.headline} accent={area.accent} />
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance max-w-3xl">{area.intro}</p>
          <Buttons center />
        </m.div>
      </section>
      <PageSections sections={sections} />
      <PageCTA
        cta={{
          heading: `Let’s get your ${area.city} business found.`,
          body: 'Start with a free website audit or book a strategy call at a time that suits you.',
        }}
      />
    </>
  )
}
