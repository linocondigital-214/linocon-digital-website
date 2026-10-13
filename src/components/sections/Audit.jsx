import { useState } from 'react'
import Reveal from '../Reveal'
import { mailtoLink, sendLead } from '../../lib/leads'
import { track } from '../../lib/analytics'

const SUBJECT = 'Free Website & SEO Audit Request — LinoCon Digital'

export default function Audit() {
  const [status, setStatus] = useState('form') // 'form' | 'sending' | 'sent' | 'mailto'

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const fields = { website: form.website.value, email: form.email.value }
    setStatus('sending')
    if (await sendLead(SUBJECT, fields)) {
      track('generate_lead', { form_name: 'free_audit', lead_delivery: 'web_form' })
      setStatus('sent')
    } else {
      // The visitor still has to press send in their email app, so this is
      // counted as a lead too, marked so it can be told apart.
      track('generate_lead', { form_name: 'free_audit', lead_delivery: 'email_app' })
      window.location.href = mailtoLink(SUBJECT, fields)
      setStatus('mailto')
    }
  }

  return (
    <section id="audit" className="py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal
          y={48}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue/25 via-surface-2 to-orange/20 p-8 sm:p-12 md:p-16 grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center"
        >
          <div className="flex flex-col gap-5">
            <span className="text-sm font-bold tracking-widest uppercase text-orange">Free audit</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">
              Find out what&#39;s costing you customers.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Send us your website and we&#39;ll reply with the top fixes holding back your
              Google rankings and enquiries. Free, with no obligation.
            </p>
          </div>

          {status === 'sent' || status === 'mailto' ? (
            <div className="rounded-2xl bg-ink/60 border border-border p-8 flex flex-col gap-3">
              <h3 className="font-display font-bold text-2xl">
                {status === 'sent' ? 'Got it, thanks!' : 'Almost there.'}
              </h3>
              <p className="text-text-secondary">
                {status === 'sent'
                  ? "We'll review your site and email your audit soon."
                  : 'Your email app should have opened with your details filled in. Just hit send.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="sr-only" htmlFor="audit-website">Your website</label>
              <input
                id="audit-website"
                name="website"
                type="text"
                required
                placeholder="yourbusiness.com"
                className="h-14 rounded-xl bg-ink/60 border border-border px-5 text-base outline-none focus:border-blue transition-colors"
              />
              <label className="sr-only" htmlFor="audit-email">Your email</label>
              <input
                id="audit-email"
                name="email"
                type="email"
                required
                placeholder="you@yourbusiness.com"
                className="h-14 rounded-xl bg-ink/60 border border-border px-5 text-base outline-none focus:border-blue transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-14 rounded-full bg-gradient-brand text-ink text-base font-bold disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Get my free audit'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
