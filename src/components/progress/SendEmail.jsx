import { useEffect, useState } from 'react'
import { mailStatus, sendClientEmail } from '../../lib/clientProgress'

const btn = 'h-11 px-5 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary inline-flex items-center'

// One button that sends a designed email straight to the client (see
// api/_lib/mail.js), so it arrives with its
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
          <b>Sent to {email}.</b> {client.details.name} gets the designed email, and a copy is in your Gmail.
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
                Goes to <b className="text-text">{email}</b>, exactly as the preview shows.
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

// Shown until RESEND_API_KEY (or GMAIL_APP_PASSWORD) is in Vercel. The
// domain's DNS is at Spaceship, where the site's domain was bought.
function MailSetup() {
  const link = (href, text) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline">
      {text}
    </a>
  )
  return (
    <div className="rounded-xl border border-orange/60 bg-orange/10 p-4 text-sm flex flex-col gap-2">
      <b>One-time setup so the site can send this email for you</b>
      <div>
        1. Go to {link('https://resend.com/signup', 'resend.com')} and sign up with <b>linocondigital@gmail.com</b> (the free plan is enough).
      </div>
      <div>
        2. In Resend, click <b>Domains</b>, then <b>Add Domain</b>. Type <b>linocondigital.com</b> and click <b>Add</b>. Resend shows a few records, each with a Type, a Name and a Value.
      </div>
      <div>
        3. In a new tab, sign in to {link('https://www.spaceship.com', 'Spaceship')} (where you bought the domain). Open <b>linocondigital.com</b>, then its <b>DNS records</b>. Click <b>Add record</b> for each record Resend shows, copying the Type, Name and Value exactly, and save.
      </div>
      <div>
        4. Back in Resend, click <b>Verify DNS Records</b>. It can take from a few minutes to a few hours to show <b>Verified</b>.
      </div>
      <div>
        5. In Resend, click <b>API Keys</b>, then <b>Create API Key</b>. Name it <b>LinoCon website</b>, keep <b>Sending access</b>, click <b>Add</b>, and copy the key.
      </div>
      <div>
        6. In Vercel, open the linocon-digital-website project, then <b>Settings</b>, <b>Environment Variables</b>. Add the name <b>RESEND_API_KEY</b>, paste the key as the value, and click <b>Save</b>. Then go to <b>Deployments</b>, click the three dots on the top one, and choose <b>Redeploy</b>.
      </div>
      <div className="text-text-secondary">
        Only paste that key into Vercel, never into a chat or email. Emails then come from lino@linocondigital.com, replies go to your Gmail, and a copy of each one lands in your Gmail inbox.
      </div>
    </div>
  )
}
