import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import Reveal from '../components/Reveal'
import { Eyebrow, Headline, PageSections } from '../components/PageSections'
import { mailtoLink, sendLead } from '../lib/leads'
import { track } from '../lib/analytics'
import usePageMeta from '../lib/usePageMeta'

const SUBJECT = 'New Referral — LinoCon Digital'

// The referral offer, as Lino set it (Oct 2026). Lino is having the fine
// print checked together with the service agreement; change both together.
const SECTIONS = [
  {
    type: 'process',
    eyebrow: 'How it works',
    heading: 'Three simple steps.',
    steps: [
      {
        title: 'Tell us who',
        body: 'Fill in the short form below with your details and your friend’s. Let them know we’ll be in touch.',
      },
      {
        title: 'We reach out',
        body: 'We contact your friend, offer a free website audit and see if we can help. No pressure on them.',
      },
      {
        title: 'You save',
        body: 'When they sign up and pay, your discount starts on your next LinoCon bill. We’ll email you when it does.',
      },
    ],
  },
]

export default function Refer() {
  usePageMeta(
    'Refer a Friend',
    'Know a business that needs a better website or more customers from Google? Refer them to LinoCon Digital and get $25 off your monthly bill for 6 months.',
  )

  // /refer#refer-form links come from other pages; scroll once the form is there.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Hero />
      <Rewards />
      <PageSections sections={SECTIONS} />
      <ReferForm />
      <FinePrint />
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
        <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">Refer a friend</span>
        <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
          <Headline text="Share LinoCon. Save on your bill." accent="Save" />
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance max-w-3xl">
          Know a business that needs a better website or more customers from Google? Send them our way.
          When they sign up, you get money off your LinoCon bill.
        </p>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <a
            href="#refer-form"
            className="flex items-center justify-center h-14 px-7 rounded-full bg-gradient-brand text-ink text-base font-bold"
          >
            Refer a business
          </a>
          <a
            href="#fine-print"
            className="flex items-center justify-center h-14 px-7 rounded-full border border-white/20 text-base font-bold hover:bg-white/5 transition-colors"
          >
            Read the fine print
          </a>
        </div>
      </m.div>
    </section>
  )
}

const REWARDS = [
  {
    label: 'They pick a monthly plan',
    amount: '$25 off',
    unit: 'your monthly bill for 6 months',
    body: 'Grow Plan, Backlink Building, Grow Bundle or LinoCon Complete. That’s up to $150 for each business you refer.',
    featured: true,
  },
  {
    label: 'They pick one-time work',
    amount: '$50 credit',
    unit: 'on your next bill',
    body: 'Website Creation, SEO Setup or a Launch Bundle. The credit is added once they’ve paid.',
  },
]

function Rewards() {
  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal className="mb-12">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="font-display font-bold leading-tight mt-4 text-balance text-3xl md:text-5xl max-w-3xl">
            A thank-you for every business you send us.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {REWARDS.map((r, i) => (
            <Reveal
              key={r.label}
              delay={i * 0.08}
              className={`rounded-3xl border p-7 md:p-8 flex flex-col gap-4 ${
                r.featured ? 'border-blue bg-gradient-to-br from-blue/20 via-surface to-orange/15' : 'border-border bg-surface'
              }`}
            >
              <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">{r.label}</span>
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display font-bold text-4xl md:text-5xl">{r.amount}</span>
                <span className="text-text-secondary">{r.unit}</span>
              </p>
              <p className="text-text-secondary leading-relaxed">{r.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-text-secondary leading-relaxed">
          <span className="font-bold text-text">Refer more than one? </span>
          Each business gets its own 6 months of savings. You can have up to 3 running at the same time
          ($75 off a month). When one ends, a new referral can take its place.
        </Reveal>
      </div>
    </section>
  )
}

function ReferForm() {
  const [status, setStatus] = useState('form') // 'form' | 'sending' | 'sent' | 'mailto'

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const fields = {
      your_name: form.yourName.value,
      your_email: form.yourEmail.value,
      friend_name: form.friendName.value,
      friend_business: form.friendBusiness.value,
      friend_email: form.friendEmail.value,
      friend_needs: form.needs.value,
      note: form.note.value,
    }
    setStatus('sending')
    if (await sendLead(SUBJECT, fields)) {
      track('generate_lead', { form_name: 'referral', lead_delivery: 'web_form' })
      setStatus('sent')
    } else {
      track('generate_lead', { form_name: 'referral', lead_delivery: 'email_app' })
      window.location.href = mailtoLink(SUBJECT, fields)
      setStatus('mailto')
    }
  }

  const input =
    'w-full min-w-0 h-14 rounded-xl bg-ink/60 border border-border px-5 text-base outline-none focus:border-blue transition-colors'
  const group = 'text-xs font-bold tracking-widest uppercase text-text-tertiary pt-2'

  return (
    <section id="refer-form" className="py-20 md:py-28 border-t border-border scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal
          y={48}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue/25 via-surface-2 to-orange/20 p-8 sm:p-12 md:p-16 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-start"
        >
          <div className="flex flex-col gap-5 min-w-0">
            <Eyebrow>Refer a business</Eyebrow>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">
              Who should we help next?
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              It takes a minute. Please let your friend know first that we&rsquo;ll be getting in
              touch. We&rsquo;ll only use their details to contact them about this referral.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Not a client yet? You can still refer someone. Your savings start once you are.
            </p>
          </div>

          {status === 'sent' || status === 'mailto' ? (
            <div className="rounded-2xl bg-ink/60 border border-border p-8 flex flex-col gap-3">
              <h3 className="font-display font-bold text-2xl">
                {status === 'sent' ? 'Thank you!' : 'Almost there.'}
              </h3>
              <p className="text-text-secondary">
                {status === 'sent'
                  ? 'We got your referral. We’ll reach out to your friend and let you know when your savings start.'
                  : 'Your email app should have opened with the details filled in. Just hit send.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-0">
              <span className={group}>About you</span>
              <label className="sr-only" htmlFor="refer-your-name">Your name</label>
              <input id="refer-your-name" name="yourName" type="text" required autoComplete="name" placeholder="Your name" className={input} />
              <label className="sr-only" htmlFor="refer-your-email">Your email</label>
              <input id="refer-your-email" name="yourEmail" type="email" required autoComplete="email" placeholder="Your email" className={input} />

              <span className={group}>About your friend</span>
              <label className="sr-only" htmlFor="refer-friend-name">Your friend&rsquo;s name</label>
              <input id="refer-friend-name" name="friendName" type="text" required autoComplete="off" placeholder="Your friend’s name" className={input} />
              <label className="sr-only" htmlFor="refer-friend-business">Their business name</label>
              <input id="refer-friend-business" name="friendBusiness" type="text" required autoComplete="off" placeholder="Their business name" className={input} />
              <label className="sr-only" htmlFor="refer-friend-email">Their email</label>
              <input id="refer-friend-email" name="friendEmail" type="email" required autoComplete="off" placeholder="Their email" className={input} />
              <label className="sr-only" htmlFor="refer-needs">What could they use help with?</label>
              <select id="refer-needs" name="needs" defaultValue="Not sure" className={`${input} appearance-none`}>
                <option value="Not sure">What could they use help with? (Not sure)</option>
                <option>A new website</option>
                <option>Showing up on Google (SEO)</option>
                <option>More customers every month (Grow Plan)</option>
              </select>
              <label className="sr-only" htmlFor="refer-note">Anything we should know? (optional)</label>
              <textarea
                id="refer-note"
                name="note"
                rows={3}
                placeholder="Anything we should know? (optional)"
                className="w-full min-w-0 rounded-xl bg-ink/60 border border-border px-5 py-4 text-base outline-none focus:border-blue transition-colors resize-y"
              />
              <label className="flex items-start gap-3 text-sm text-text-secondary leading-snug">
                <input type="checkbox" required className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--color-blue)]" />
                My friend knows I&rsquo;m sharing their details with LinoCon Digital.
              </label>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-14 rounded-full bg-gradient-brand text-ink text-base font-bold disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Send referral'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}

const TERMS = [
  'Monthly plans: $25 off your monthly bill for 6 months for each business you refer that signs up for a monthly plan.',
  'One-time work: a one-time $50 credit on your next bill once the business you referred has paid.',
  'Up to 3 referral discounts at a time ($75 off a month at most). A new one can start when another ends.',
  'Savings go on your LinoCon Digital bill. They can’t bring a bill below $0 and aren’t paid out as cash.',
  'The $25 discount stops early if either your plan or your friend’s plan is cancelled.',
  'The business you refer must be new to LinoCon Digital, and can’t be your own business.',
  'Savings start once you’re a paying client and your friend has paid their first bill.',
  'We may change or end this offer at any time. Savings already started will finish as promised.',
]

function FinePrint() {
  return (
    <section id="fine-print" className="py-20 md:py-28 border-t border-border scroll-mt-20">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal>
          <Eyebrow>The fine print</Eyebrow>
          <h2 className="font-display font-bold leading-tight mt-4 text-3xl md:text-4xl">Short and simple.</h2>
          <ul className="mt-8 flex flex-col gap-3 text-text-secondary leading-relaxed list-disc pl-5">
            {TERMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary pt-6">
            Prices in Canadian dollars. See our <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>{' '}
            for how we handle referral details.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
