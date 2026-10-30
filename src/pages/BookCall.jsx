import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { CONTACT_EMAIL, sendLead } from '../lib/leads'
import { track } from '../lib/analytics'
import EmailUs from '../components/EmailUs'
import usePageMeta from '../lib/usePageMeta'

const CAL_COM_LINK = 'linocondigital/strategy-call'

export default function BookCall() {
  const [status, setStatus] = useState('form') // 'form' | 'submitting' | 'scheduling'
  usePageMeta(
    'Book a Free Strategy Call',
    "Book a free strategy call with LinoCon Digital. Tell us about your business and we'll show you what's holding your website and Google rankings back.",
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')

    const form = e.target
    // Email the details if forms are set up, but never block the booking on
    // it: the calendar step collects name and email too.
    const delivered = await sendLead('New Strategy Call Request — LinoCon Digital', {
      name: form.name.value,
      email: form.email.value,
      company: form.company.value,
      goal: form.goal.value,
    })
    track('generate_lead', {
      form_name: 'strategy_call',
      lead_delivery: delivered ? 'web_form' : 'not_delivered',
    })
    setStatus('scheduling')
  }

  return (
    <section className="min-h-screen pt-40 pb-28">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal>
          <Link to="/" className="text-sm font-semibold text-text-secondary hover:text-text">
            &larr; Back to home
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight">
            Book a Strategy Call
          </h1>
          <p className="text-lg text-text-secondary mt-4 max-w-xl">
            Tell us a bit about your business, then pick a time that works for you. No
            obligation — just a real conversation about where the leverage is.
          </p>
          <p className="text-text-secondary mt-4 max-w-xl">
            Moving from another provider?{' '}
            <Link to="/switch" className="underline underline-offset-4">
              See what to get ready
            </Link>{' '}
            before the call.
          </p>
          <p className="text-text-secondary mt-4 max-w-xl">
            Prefer email? Write to us at{' '}
            <EmailUs className="underline underline-offset-4 whitespace-nowrap">
              {CONTACT_EMAIL}
            </EmailUs>
            .
          </p>
        </Reveal>

        {(status === 'form' || status === 'submitting') && (
          <Reveal delay={0.15}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
              <Field label="Full name" name="name" type="text" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Company / website" name="company" type="text" required />
              <div className="flex flex-col gap-2">
                <label htmlFor="goal" className="text-sm font-semibold text-text-secondary">
                  What are you looking to achieve?
                </label>
                <textarea
                  id="goal"
                  name="goal"
                  rows={4}
                  required
                  className="rounded-xl bg-surface border border-border px-4 py-3 text-base outline-none focus:border-blue transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex items-center justify-center h-14 px-8 rounded-full bg-gradient-brand text-ink text-base font-bold disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending...' : 'Continue to Calendar'}
              </button>
            </form>
          </Reveal>
        )}

        {status === 'scheduling' && (
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-border bg-surface">
              <iframe
                title="Book a Strategy Call"
                src={`https://cal.com/${CAL_COM_LINK}?embed=true&theme=dark`}
                width="100%"
                height="700"
                style={{ border: 0 }}
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function Field({ label, name, type, required }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-text-secondary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="h-14 rounded-xl bg-surface border border-border px-4 text-base outline-none focus:border-blue transition-colors"
      />
    </div>
  )
}
