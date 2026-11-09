import { useEffect } from 'react'
import { m } from 'framer-motion'
import { Buttons, Headline, PageCTA, PageSections } from '../components/PageSections'
import usePageMeta from '../lib/usePageMeta'
import { AREAS, areaPath } from '../lib/areaPages'

// Where LinoCon works and who it helps: Vancouver base, remote across Canada
// and the US. Backs up the areaServed schema (index.html and
// src/entry-server.jsx) with a page Google can rank for "Canada"/"US" searches.
// Keep it in step with the FAQ answers about working outside Vancouver.
const SECTIONS = [
  {
    type: 'cards',
    eyebrow: 'Where we work',
    heading: 'One team, working remotely across two countries.',
    intro:
      'We’re based in Vancouver, BC. Because everything happens online, where your business is doesn’t change the service you get.',
    items: [
      {
        title: 'British Columbia',
        body: 'Our home base. We work with businesses in Vancouver and right across the province.',
      },
      {
        title: 'Across Canada',
        body: 'Any province or territory. Our prices are in Canadian dollars, so there’s no currency to convert.',
      },
      {
        title: 'The United States',
        body: 'We work with US businesses too. We book calls at times that suit your time zone, and you pay online by card.',
      },
    ],
  },
  {
    type: 'cards',
    eyebrow: 'Areas we serve',
    heading: 'Close to home in Metro Vancouver.',
    intro: 'Each of these cities has its own page about how we help local businesses get found there.',
    items: AREAS.map((a) => ({
      title: a.city,
      body: `Website design and SEO for small businesses in ${a.city}, BC.`,
      link: { to: areaPath(a), label: `Web design in ${a.city}` },
    })),
  },
  {
    type: 'checklist',
    eyebrow: 'Who we help',
    heading: 'Small businesses that want more customers from Google.',
    intro:
      'You don’t need to know anything about websites or SEO. If any of these sound like you, we can help.',
    items: [
      'You’re starting a new business and need a website',
      'Your website is old, slow or hard to use on a phone',
      'Customers can’t find you when they search on Google',
      'You serve one city or area and want to show up there',
      'You want to move your website from another provider',
      'You want someone to keep your SEO growing every month',
    ],
  },
  {
    type: 'process',
    eyebrow: 'How working remotely works',
    heading: 'Four simple steps, all online.',
    steps: [
      {
        title: 'Free call',
        body: 'We meet on a video call at a time that works for your time zone, and look at where your business is today.',
      },
      {
        title: 'A clear plan',
        body: 'You get a written plan and quote. If you go ahead, you sign the agreement online.',
      },
      {
        title: 'Build and launch',
        body: 'You follow your project on your own client page and approve each step before it goes live.',
      },
      {
        title: 'Grow',
        body: 'We keep improving your SEO and send you updates by email, so you always know what’s happening.',
      },
    ],
  },
  {
    type: 'text',
    eyebrow: 'Local SEO, wherever you are',
    heading: 'Built around your customers, not our location.',
    body: [
      'Being found on Google is about where your customers are. We look at the city or area you serve, the words local people search for and the businesses you compete with.',
      'Then we set up your website and Google Business Profile so you show up in your own market, whether that’s Toronto, Calgary, Seattle or a small town.',
    ],
    link: { to: '/services/seo-setup', label: 'See SEO Setup' },
  },
  {
    type: 'cards',
    eyebrow: 'Common questions',
    heading: 'Working with us from another city.',
    items: [
      {
        title: 'Do I need to be in Vancouver?',
        body: 'No. Calls, updates and approvals all happen online, so you get the same service anywhere in Canada or the US.',
      },
      {
        title: 'How do I pay?',
        body: 'Online by card. Prices are in Canadian dollars. If you’re in the US, your card provider converts the amount to US dollars.',
      },
      {
        title: 'What if I’m outside Canada and the US?',
        body: 'Get in touch and tell us where you are. We’ll let you know honestly if we’re a good fit.',
      },
    ],
  },
]

export default function WhoWeWorkWith() {
  usePageMeta(
    'Who We Work With: Canada & the US',
    'LinoCon Digital builds websites and SEO for small businesses across Canada and the United States. Based in Vancouver, BC, working remotely. Prices in CAD.',
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Hero />
      <PageSections sections={SECTIONS} />
      <PageCTA
        cta={{
          heading: 'Wherever you are, let’s get you found.',
          body: 'Start with a free website audit or book a strategy call at a time that suits you.',
        }}
      />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
      <div className="pointer-events-none absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full opacity-20 bg-[radial-gradient(closest-side,var(--color-blue),transparent)]" />
      <div className="pointer-events-none absolute -top-12 -right-72 w-[880px] h-[880px] rounded-full opacity-15 bg-[radial-gradient(closest-side,var(--color-orange),transparent)]" />

      <m.div
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-4xl mx-auto px-6 md:px-10 flex flex-col items-center text-center gap-6"
      >
        <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">Who we work with</span>
        <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
          <Headline
            text="Websites and SEO for small businesses across Canada and the US."
            accent="Canada and the US"
          />
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance max-w-3xl">
          LinoCon Digital is based in Vancouver, BC, and works remotely with small businesses anywhere in
          Canada and the United States.
        </p>
        <Buttons center />
      </m.div>
    </section>
  )
}
