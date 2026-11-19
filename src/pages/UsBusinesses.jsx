import { useEffect } from 'react'
import { m } from 'framer-motion'
import { Buttons, Headline, PageCTA, PageSections } from '../components/PageSections'
import usePageMeta from '../lib/usePageMeta'

// For US businesses thinking of hiring a Canadian web team. Answers the
// practical questions (CAD prices, time zones, calls, signing, paying) that
// /who-we-work-with only touches on. Keep it honest: no US office or address,
// no invented exchange rates, numbers or testimonials.
const SECTIONS = [
  {
    type: 'cards',
    eyebrow: 'Why a Canadian team',
    heading: 'Same service, just across the border.',
    intro:
      'We build websites and set up SEO for small businesses. Everything happens online, so working with a US business is no different from working with one down the street.',
    items: [
      {
        title: 'Your market, not ours',
        body: 'We research the city or area you serve in the US, the words your customers search for and the businesses you compete with there.',
        link: { to: '/services/seo-setup', label: 'See SEO Setup' },
      },
      {
        title: 'A website built for your customers',
        body: 'Fast, easy to use on a phone, and written for the people you serve, with your address, phone number and hours shown the US way.',
        link: { to: '/services/website-creation', label: 'See Website Creation' },
      },
      {
        title: 'Growth every month',
        body: 'If you choose a monthly plan, we keep building your search presence and links to your site, and tell you what we did.',
        link: { to: '/services/backlink-building', label: 'See Backlink Building' },
      },
    ],
  },
  {
    type: 'text',
    eyebrow: 'Prices in Canadian dollars',
    heading: 'What paying in CAD means for you.',
    body: [
      'All our prices are in Canadian dollars (CAD). You pay online by card, and your card provider converts the amount into US dollars on the day you pay, at their own exchange rate.',
      'Some cards add a foreign transaction fee for payments to a business in another country. That fee comes from your bank, not from us, so check with your card provider if you’re not sure. Your quote and invoices always show the exact CAD amount before you pay.',
    ],
    link: { to: '/bundles/launch-bundle', label: 'See the Launch Bundle' },
  },
  {
    type: 'cards',
    eyebrow: 'Time zones',
    heading: 'We’re on Pacific Time, same as the West Coast.',
    intro:
      'Vancouver uses the same time zone as Seattle, Portland, San Francisco and Los Angeles. For the rest of the US, we’re only a few hours behind.',
    items: [
      {
        title: 'West Coast',
        body: 'Same time as us. Our regular hours line up with yours.',
      },
      {
        title: 'Mountain and Central',
        body: 'One to two hours ahead of us. Morning and midday calls work well for both sides.',
      },
      {
        title: 'East Coast',
        body: 'Three hours ahead of us. Late morning and afternoon on your side is early in our day, which works well.',
      },
    ],
  },
  {
    type: 'process',
    eyebrow: 'How calls and projects work',
    heading: 'Everything online, nothing to mail.',
    steps: [
      {
        title: 'Book a call',
        body: 'Pick a time on our booking page. The calendar shows times in your own time zone, and you get a video call link by email.',
      },
      {
        title: 'Get your plan',
        body: 'After the call, you get a written plan and a clear quote in CAD. No pressure to go ahead.',
      },
      {
        title: 'Sign and pay online',
        body: 'You sign the agreement on your own secure client page, then pay the deposit by card.',
      },
      {
        title: 'Follow along',
        body: 'You see each step on your client page and approve the work before it goes live. Questions by email or phone any time.',
      },
    ],
  },
  {
    type: 'cards',
    eyebrow: 'Good to know',
    heading: 'Straight answers before you start.',
    items: [
      {
        title: 'Do you have a US office?',
        body: 'No. We’re based in Vancouver, BC, and work with US businesses remotely. You talk to the same person from the first call to launch.',
      },
      {
        title: 'Can you help me show up in my own city?',
        body: 'Yes. Local SEO is about where your customers are, not where we are. We set up your site and Google Business Profile for your area.',
      },
      {
        title: 'What if I’m not sure I need this?',
        body: 'Start with a free audit or a free call. We’ll tell you honestly what would help and what you can skip.',
      },
    ],
  },
  {
    type: 'text',
    eyebrow: 'Also in Canada',
    heading: 'Working with businesses on both sides of the border.',
    body: [
      'We work with small businesses across Canada and the United States. See where we work and the areas we serve close to home in British Columbia.',
    ],
    link: { to: '/who-we-work-with', label: 'See who we work with' },
  },
]

export default function UsBusinesses() {
  usePageMeta(
    'Websites & SEO for US Small Businesses',
    'LinoCon Digital builds websites and SEO for small businesses in the United States, working remotely from Vancouver, BC. Pacific Time, prices in CAD, everything online.',
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
          heading: 'Let’s get your US business found.',
          body: 'Start with a free website audit, or book a call at a time that suits your time zone.',
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
        <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">For US businesses</span>
        <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
          <Headline text="Websites and SEO for small businesses in the US." accent="in the US" />
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance max-w-3xl">
          We’re a small web team in Vancouver, BC, on Pacific Time. We work remotely with US businesses,
          with calls in your time zone and simple online signing and payment.
        </p>
        <Buttons center />
      </m.div>
    </section>
  )
}
