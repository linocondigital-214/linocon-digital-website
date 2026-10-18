import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { CONTACT_EMAIL } from '../lib/leads'
import usePageMeta from '../lib/usePageMeta'

// Public Stripe payment link for the Grow Plan (monthly). Payment happens on
// Stripe's own page; the site never sees card or bank details.
const GROW_PLAN_LINK = 'https://buy.stripe.com/dRm7sL1W14hZ3b5aer24000'

const INVOICE_STEPS = [
  'Open the invoice email from LinoCon Digital.',
  'Click Pay this invoice. It opens a secure Stripe page.',
  'Pay by card. You get a receipt by email straight away.',
]

export default function Pay() {
  usePageMeta('Pay', 'Pay a LinoCon Digital invoice or start your monthly Grow Plan. Secure checkout by Stripe.')

  return (
    <section className="min-h-screen pt-40 pb-28">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <Reveal className="mb-14">
          <span className="text-sm font-bold tracking-widest uppercase text-orange">Payments</span>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight mt-4">
            Pay <span className="text-gradient">LinoCon Digital</span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mt-5">
            Secure checkout by Stripe. We never see your card or bank details.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <Reveal y={40} className="rounded-3xl border border-border bg-surface p-7 md:p-8 flex flex-col gap-6">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">Pay an invoice</h2>
              <p className="text-text-secondary mt-2">For website projects, SEO setup and any other invoiced work.</p>
            </div>
            <ol className="flex flex-col gap-3 flex-1">
              {INVOICE_STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-text-secondary">
                  <span className="shrink-0 w-6 h-6 rounded-full border border-border text-xs font-bold text-text flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-sm text-text-secondary">
              Already a client? The <b className="text-text">Pay now</b> button is also on your private progress page.
              Can&rsquo;t find your invoice? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}?subject=Please%20resend%20my%20invoice`} className="text-text! underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>{' '}
              and we&rsquo;ll resend it.
            </p>
          </Reveal>

          <Reveal
            y={40}
            delay={0.08}
            className="rounded-3xl border border-blue bg-gradient-to-br from-blue/20 via-surface to-orange/15 p-7 md:p-8 flex flex-col gap-6"
          >
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">Start your Grow Plan</h2>
              <p className="text-text-secondary mt-2">Monthly website care and SEO, charged automatically each month.</p>
            </div>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display font-bold text-4xl md:text-5xl">$349.99</span>
              <span className="text-text-secondary">/ month</span>
            </p>
            <ul className="flex flex-col gap-3 flex-1 text-text-secondary">
              <li>Monthly performance review and SEO improvements</li>
              <li>Technical health check and Google Business Profile upkeep</li>
              <li>Your monthly progress update</li>
            </ul>
            <div className="flex flex-col gap-3">
              <a
                href={GROW_PLAN_LINK}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center h-13 px-6 rounded-full text-base font-bold bg-gradient-brand text-ink!"
              >
                Start Grow Plan
              </a>
              <Link to="/book" className="text-sm font-semibold text-text-secondary! hover:text-text! text-center">
                Not sure yet? Book a free strategy call &rarr;
              </Link>
            </div>
          </Reveal>
        </div>

        <p className="text-sm text-text-secondary pt-8">
          Prices in Canadian dollars. Taxes extra where applicable. Your proposal and service agreement set out what you
          pay and when.
        </p>
      </div>
    </section>
  )
}
