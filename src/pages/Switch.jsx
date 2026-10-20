import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import Reveal from '../components/Reveal'
import { Eyebrow, Headline, SECTIONS } from '../components/PageSections'
import { CONTACT_EMAIL, mailtoLink, sendLead } from '../lib/leads'
import { track } from '../lib/analytics'
import usePageMeta from '../lib/usePageMeta'

const SUBJECT = 'New Switch Request — LinoCon Digital'

// For businesses that already have a website (and maybe Google, social pages,
// another agency) and want to move it to LinoCon. The page never asks for
// passwords: businesses invite our email where a platform allows it, and
// anything else is done together on a call.
const STEPS = {
  eyebrow: 'How the switch works',
  heading: 'Four steps. Your website stays online the whole time.',
  steps: [
    {
      title: 'Tell us what you have',
      body: 'Fill in the short form below. It’s fine if you don’t know every answer yet.',
    },
    {
      title: 'Free call',
      body: 'We look at your website and accounts together and agree on a plan. Nothing changes yet.',
    },
    {
      title: 'Give us access',
      body: 'You invite our email to the accounts we need. No passwords. We’ll show you how, step by step.',
    },
    {
      title: 'We take it from here',
      body: 'We move things over, check that everything works, then tell you when it’s safe to cancel your old provider.',
    },
  ],
}

const GATHER = {
  eyebrow: 'What to get ready',
  heading: 'A simple list of what we’ll need from you.',
  intro:
    'You don’t need all of this before you contact us. Gather what you can, and we’ll help you find the rest on our call.',
  groups: [
    {
      title: 'Your website and domain',
      items: [
        'Your website address',
        'Where you bought your domain name (for example GoDaddy or Namecheap)',
        'Where your website is built or hosted (for example Wix, Squarespace, WordPress or Shopify)',
        'Who looks after it now, and when their plan or contract ends',
        'Who provides your business email, so it keeps working during the move',
      ],
    },
    {
      title: 'Google',
      items: [
        'Google Business Profile: add our email as a Manager',
        'Google Analytics: add our email as a user',
        'Google Search Console: add our email as a user',
        'Google Ads, if you use it',
      ],
    },
    {
      title: 'Social media',
      items: [
        'A list of your pages (Facebook, Instagram, TikTok, X, LinkedIn and others)',
        'Facebook and Instagram: add our email as a partner or person in Meta Business Suite',
        'Who else can post or manage them today',
      ],
    },
    {
      title: 'Your brand and content',
      items: [
        'Your logo, in the best quality you have',
        'Photos of your work, team or shop',
        'Your brand colours and fonts, if you have them',
        'Your list of services or products, and prices you want shown',
        'Wording and pages you want to keep',
        'Real customer reviews you’re happy for us to use',
      ],
    },
  ],
  note: 'A clear picture of what you own, what we’ll look after, and nothing lost along the way.',
}

const QUESTIONS = [
  {
    title: 'Will my website go down?',
    body: 'No. Your current website stays online while we work. We only switch things over once the new setup is ready and checked.',
  },
  {
    title: 'Should I cancel my current provider first?',
    body: 'Not yet. Keep everything running until we tell you it’s safe to cancel. That way nothing is lost.',
  },
  {
    title: 'Who owns my website and accounts?',
    body: 'You do. We’re added as a helper on your accounts, and you can remove us any time.',
  },
  {
    title: 'I don’t know my logins. Is that a problem?',
    body: 'That’s very common. We’ll help you find them or get them back on our call.',
  },
  {
    title: 'Do I have to move everything at once?',
    body: 'No. You can start with one thing, like your website or Google, and move the rest later.',
  },
  {
    title: 'Does it cost anything to switch?',
    body: 'The form and the call are free. If you go ahead, we’ll give you a clear quote before any work starts.',
  },
]

export default function Switch() {
  usePageMeta(
    'Switching to LinoCon',
    'Already have a website? See how easy it is to move your website, Google and SEO over to LinoCon Digital, and what to get ready. No passwords needed.',
  )

  // /switch#switch-form links come from other pages; scroll once the form is there.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Hero />
      <Section>
        <SECTIONS.process s={STEPS} />
      </Section>
      <Section id="gather">
        <SECTIONS.groups s={GATHER} />
        <NoPasswords />
      </Section>
      <SwitchForm />
      <Section>
        <SECTIONS.cards s={{ eyebrow: 'Good to know', heading: 'Common questions.', items: QUESTIONS }} />
      </Section>
    </>
  )
}

function Section({ id, children }) {
  return (
    <section id={id} className="py-20 md:py-28 border-t border-border scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">{children}</div>
    </section>
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
        <span className="text-sm font-bold tracking-widest uppercase text-text-tertiary">Switching to LinoCon</span>
        <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] text-balance">
          <Headline text="Already have a website? Moving is easy." accent="easy." />
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-text-secondary text-balance max-w-3xl">
          Want us to look after your website, Google and SEO instead of your current provider? Here&rsquo;s
          how it works, and exactly what to get ready. You&rsquo;ll never need to send us a password.
        </p>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <a
            href="#switch-form"
            className="flex items-center justify-center h-14 px-7 rounded-full bg-gradient-brand text-ink text-base font-bold"
          >
            Start your switch
          </a>
          <a
            href="#gather"
            className="flex items-center justify-center h-14 px-7 rounded-full border border-white/20 text-base font-bold hover:bg-white/5 transition-colors"
          >
            See what to get ready
          </a>
        </div>
      </m.div>
    </section>
  )
}

function NoPasswords() {
  return (
    <Reveal className="mt-5 rounded-3xl border border-orange/50 bg-gradient-to-br from-orange/15 via-surface to-surface p-7 md:p-8 flex flex-col gap-3 max-w-4xl">
      <h3 className="font-display font-bold text-xl md:text-2xl">Please don&rsquo;t send us passwords.</h3>
      <p className="text-text-secondary leading-relaxed">
        We&rsquo;ll never ask for them by email, text or form. Where an account lets you invite a helper,
        invite <span className="font-bold text-text break-all sm:break-normal sm:whitespace-nowrap">{CONTACT_EMAIL}</span>. You stay the
        owner and can remove us any time. For anything that can&rsquo;t be shared that way, we&rsquo;ll do it
        together on a call.
      </p>
    </Reveal>
  )
}

const TAKE_OVER = ['My website', 'Showing up on Google (SEO)', 'Backlinks', 'Google Business Profile', 'Not sure yet']

function SwitchForm() {
  const [status, setStatus] = useState('form') // 'form' | 'sending' | 'sent' | 'mailto'

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const takeOver = [...form.querySelectorAll('input[name="takeOver"]:checked')].map((el) => el.value)
    const fields = {
      name: form.yourName.value,
      email: form.yourEmail.value,
      business: form.business.value,
      website: form.website.value,
      built_with: form.builtWith.value,
      looked_after_by: form.lookedAfter.value,
      contract_ends: form.contractEnds.value,
      take_over: takeOver.join(', ') || 'Not said',
      note: form.note.value,
    }
    setStatus('sending')
    if (await sendLead(SUBJECT, fields)) {
      track('generate_lead', { form_name: 'switch', lead_delivery: 'web_form' })
      setStatus('sent')
    } else {
      track('generate_lead', { form_name: 'switch', lead_delivery: 'email_app' })
      window.location.href = mailtoLink(SUBJECT, fields)
      setStatus('mailto')
    }
  }

  const input =
    'w-full min-w-0 h-14 rounded-xl bg-ink/60 border border-border px-5 text-base outline-none focus:border-blue transition-colors'
  const group = 'text-xs font-bold tracking-widest uppercase text-text-tertiary pt-2'

  return (
    <section id="switch-form" className="py-20 md:py-28 border-t border-border scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal
          y={48}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue/25 via-surface-2 to-orange/20 p-8 sm:p-12 md:p-16 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-start"
        >
          <div className="flex flex-col gap-5 min-w-0">
            <Eyebrow>Start your switch</Eyebrow>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">
              Tell us what you have today.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              It takes a few minutes. Answer what you can and pick &ldquo;Not sure&rdquo; for the rest.
              We&rsquo;ll get back to you to book a free call.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Rather talk first? <Link to="/book" className="underline underline-offset-4">Book a free call</Link>.
            </p>
          </div>

          {status === 'sent' || status === 'mailto' ? (
            <div className="rounded-2xl bg-ink/60 border border-border p-8 flex flex-col gap-3">
              <h3 className="font-display font-bold text-2xl">
                {status === 'sent' ? 'Thank you!' : 'Almost there.'}
              </h3>
              <p className="text-text-secondary">
                {status === 'sent'
                  ? 'We got your details. We’ll be in touch to book a free call. In the meantime, you can start gathering the things on the list above.'
                  : 'Your email app should have opened with the details filled in. Just hit send.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-w-0">
              <span className={group}>About you</span>
              <label className="sr-only" htmlFor="switch-name">Your name</label>
              <input id="switch-name" name="yourName" type="text" required autoComplete="name" placeholder="Your name" className={input} />
              <label className="sr-only" htmlFor="switch-email">Your email</label>
              <input id="switch-email" name="yourEmail" type="email" required autoComplete="email" placeholder="Your email" className={input} />
              <label className="sr-only" htmlFor="switch-business">Business name</label>
              <input id="switch-business" name="business" type="text" required autoComplete="organization" placeholder="Business name" className={input} />

              <span className={group}>Your website today</span>
              <label className="sr-only" htmlFor="switch-website">Website address</label>
              <input id="switch-website" name="website" type="text" required autoComplete="url" placeholder="Website address" className={input} />
              <label className="text-sm font-semibold text-text-secondary -mb-2" htmlFor="switch-built">Where is your website built?</label>
              <select id="switch-built" name="builtWith" defaultValue="Not sure" className={`${input} appearance-none`}>
                <option>Not sure</option>
                <option>Wix</option>
                <option>Squarespace</option>
                <option>WordPress</option>
                <option>Shopify</option>
                <option>GoDaddy</option>
                <option>Built by hand / custom</option>
                <option>Something else</option>
              </select>
              <label className="text-sm font-semibold text-text-secondary -mb-2" htmlFor="switch-looked-after">Who looks after it now?</label>
              <select id="switch-looked-after" name="lookedAfter" defaultValue="Not sure" className={`${input} appearance-none`}>
                <option>Not sure</option>
                <option>I do it myself</option>
                <option>Another agency or freelancer</option>
                <option>A friend or family member</option>
                <option>Nobody right now</option>
              </select>
              <label className="sr-only" htmlFor="switch-contract">When does their plan end? (optional)</label>
              <input id="switch-contract" name="contractEnds" type="text" autoComplete="off" placeholder="When does their plan end?" className={input} />

              <fieldset className="flex flex-col gap-3 min-w-0">
                <legend className={`${group} mb-3`}>What would you like us to take over?</legend>
                {TAKE_OVER.map((t) => (
                  <label key={t} className="flex items-center gap-3 text-text-secondary">
                    <input type="checkbox" name="takeOver" value={t} className="w-5 h-5 shrink-0 accent-[var(--color-blue)]" />
                    {t}
                  </label>
                ))}
              </fieldset>

              <label className="sr-only" htmlFor="switch-note">Anything else we should know? (optional)</label>
              <textarea
                id="switch-note"
                name="note"
                rows={3}
                placeholder="Anything else we should know? Please don’t include passwords. (optional)"
                className="w-full min-w-0 rounded-xl bg-ink/60 border border-border px-5 py-4 text-base outline-none focus:border-blue transition-colors resize-y"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-14 rounded-full bg-gradient-brand text-ink text-base font-bold disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Send my details'}
              </button>
              <p className="text-sm text-text-secondary">
                See our <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link> for how we
                handle your details.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
