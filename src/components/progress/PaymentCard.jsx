import { useState } from 'react'

// Only Stripe's own pages (payment links, invoices, billing portal) are
// allowed, so a typo can't send a client somewhere else. api/_lib/client.js
// checks the same thing when saving.
export function isStripeLink(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'stripe.com' || url.hostname.endsWith('.stripe.com'))
  } catch {
    return false
  }
}

// The client's Pay button. Payment happens on Stripe's own page; the site
// never sees card or bank details. With `editable`, Lino pastes the links.
export default function PaymentCard({ client, editable, onChange }) {
  const payment = client.payment ?? {}
  if (!editable && !payment.link) return null
  return editable ? <PaymentEdit payment={payment} onChange={onChange} /> : <PaymentView payment={payment} />
}

function PaymentView({ payment }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <CardIcon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-secondary">Payment</p>
        <p className="font-bold text-lg md:text-xl break-words">{payment.label || 'Pay LinoCon Digital'}</p>
        <p className="text-sm text-text-secondary mt-1">Secure checkout by Stripe. LinoCon Digital never sees your card or bank details.</p>
      </div>
      <div className="flex flex-col sm:items-end gap-2 shrink-0">
        <a
          href={payment.link}
          target="_blank"
          rel="noreferrer noopener"
          className="h-12 px-8 rounded-full bg-gradient-brand text-ink! font-bold flex items-center justify-center"
        >
          Pay now
        </a>
        {payment.portal && (
          <a href={payment.portal} target="_blank" rel="noreferrer noopener" className="text-sm font-semibold text-text-secondary! hover:text-text! text-center">
            Manage billing &rarr;
          </a>
        )}
      </div>
    </div>
  )
}

function PaymentEdit({ payment, onChange }) {
  const save = (key) => (value) => onChange([{ path: ['payment', key], value: value || null }])
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <div className="flex items-start gap-4">
        <CardIcon />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-secondary">Payment</p>
          <h2 className="font-bold text-lg md:text-xl">Pay button</h2>
          <p className="text-sm text-text-secondary mt-1">
            Paste this client's Stripe payment link and the client sees a <b className="text-text">Pay now</b> button on their page. Leave it empty
            to hide the button.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mt-5">
        <Field label="What it's for" hint="For example: Grow Plan, $349.99/month" value={payment.label ?? ''} onSave={save('label')} max={120} />
        <Field label="Stripe payment link" hint="https://buy.stripe.com/..." value={payment.link ?? ''} onSave={save('link')} link />
        <Field
          label="Billing portal link (optional)"
          hint="https://billing.stripe.com/p/login/..."
          note="Lets monthly clients update their card or see receipts."
          value={payment.portal ?? ''}
          onSave={save('portal')}
          link
        />
        {payment.link && (
          <div className="flex items-end">
            <a
              href={payment.link}
              target="_blank"
              rel="noreferrer noopener"
              className="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary"
            >
              Test the link
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, hint, note, value, onSave, link = false, max = 500 }) {
  const [draft, setDraft] = useState(value)
  const clean = draft.trim()
  const invalid = link && clean !== '' && !isStripeLink(clean)

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type={link ? 'url' : 'text'}
        inputMode={link ? 'url' : undefined}
        placeholder={hint}
        value={draft}
        maxLength={max}
        aria-invalid={invalid}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => !invalid && clean !== value && onSave(clean)}
        className={`h-11 rounded-lg bg-ink border px-3 text-sm outline-none focus:border-blue ${invalid ? 'border-orange' : 'border-border'}`}
      />
      {invalid ? (
        <span className="text-xs text-orange">This needs to be a Stripe link starting with https:// (copy it from your Stripe dashboard). Not saved yet.</span>
      ) : (
        note && <span className="text-xs text-text-secondary">{note}</span>
      )}
    </label>
  )
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-text-secondary mt-0.5 hidden sm:block">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18 M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
