import { useEffect, useState } from 'react'
import { mailStatus, sendClientEmail } from '../../lib/clientProgress'

const btn = 'h-11 px-5 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary inline-flex items-center'

// One button that sends a designed email straight to the client from
// linocondigital@gmail.com (see api/_lib/mail.js), so it arrives with its
// look. Until sending is set up, it shows the one-time steps. `children` is
// the do-it-yourself Gmail way, kept behind a toggle.
export default function SendEmail({ client, subject, html, text, label, onSent, children }) {
  const [ready, setReady] = useState(null) // null while checking
  const [state, setState] = useState('idle') // 'idle' | 'sending' | 'sent'
  const [error, setError] = useState('')
  const [diy, setDiy] = useState(false)
  const email = client.details.email?.trim()

  useEffect(() => {
    mailStatus()
      .then((d) => setReady(d.ready))
      .catch(() => setReady(false))
  }, [])

  async function send() {
    setState('sending')
    setError('')
    try {
      await sendClientEmail(client.id, { subject, html, text })
      setState('sent')
      onSent?.()
    } catch (err) {
      if (err.code === 'mail-setup') setReady(false)
      setError(err.message)
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {ready === false ? (
        <MailSetup />
      ) : state === 'sent' ? (
        <div className="rounded-xl border border-blue/50 bg-blue/10 p-4 text-sm">
          <b>Sent to {email}.</b> {client.details.name} gets the designed email, and a copy is in your Gmail <b>Sent</b> folder.
          <button type="button" onClick={send} className="block mt-2 text-text-secondary underline">
            Send it again
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={send}
            disabled={!email || ready === null || state === 'sending'}
            className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold disabled:opacity-40"
          >
            {state === 'sending' ? 'Sending…' : label}
          </button>
          <span className="text-sm text-text-secondary">
            {email ? (
              <>
                Goes to <b className="text-text">{email}</b> from linocondigital@gmail.com, exactly as the preview shows.
              </>
            ) : (
              'Add the client’s email address in their details first.'
            )}
          </span>
        </div>
      )}
      {error && ready !== false && <p className="text-sm text-orange">{error}</p>}
      {children && (
        <>
          <button type="button" onClick={() => setDiy(!diy)} aria-expanded={diy} className={`${btn} self-start`}>
            {diy ? 'Hide' : 'Send it yourself from Gmail instead'}
          </button>
          {diy && children}
        </>
      )}
    </div>
  )
}

// Shown until GMAIL_APP_PASSWORD is in Vercel.
function MailSetup() {
  return (
    <div className="rounded-xl border border-orange/60 bg-orange/10 p-4 text-sm flex flex-col gap-2">
      <b>One-time setup so the site can send this email for you</b>
      <div>
        1. Open{' '}
        <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline">
          myaccount.google.com/apppasswords
        </a>{' '}
        signed in as <b>linocondigital@gmail.com</b>. If Google says it isn’t available, turn on <b>2-Step Verification</b> first, then open the link again.
      </div>
      <div>
        2. Type the name <b>LinoCon website</b> and click <b>Create</b>. Copy the 16-letter password Google shows.
      </div>
      <div>
        3. In Vercel, open the linocon-digital-website project, then <b>Settings</b>, <b>Environment Variables</b>. Add the name <b>GMAIL_APP_PASSWORD</b>, paste the password as the value,
        and click <b>Save</b>.
      </div>
      <div>
        4. Go to <b>Deployments</b>, click the three dots on the top one, and choose <b>Redeploy</b>. Then reload this page.
      </div>
      <div className="text-text-secondary">Only paste that password into Vercel, never into a chat or email.</div>
    </div>
  )
}
