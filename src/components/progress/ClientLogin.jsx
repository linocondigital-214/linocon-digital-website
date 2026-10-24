import { useEffect, useState } from 'react'
import { dateLabel, fetchClientLogin, inviteClientLogin, removeClientLogin } from '../../lib/clientProgress'
import { agoLabel } from '../../lib/clientOverview'
import EmailOptions from '../EmailOptions'

// The client's own login to linocondigital.com/clients, on their admin page.
// Lino creates a one-time invite code and sends it to the client, who uses it
// to choose their email and password. A new code is also how a forgotten
// password gets reset.
export default function ClientLogin({ client }) {
  const [login, setLogin] = useState(null)
  const [code, setCode] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClientLogin(client.id)
      .then(setLogin)
      .catch(() => setError("Couldn't load the client's login. Refresh the page to try again."))
  }, [client.id])

  async function run(work) {
    setBusy(true)
    setError('')
    try {
      await work()
    } catch {
      setError("That didn't work. Check your connection and try again.")
    }
    setBusy(false)
  }

  const invite = () =>
    run(async () => {
      const res = await inviteClientLogin(client.id)
      setCode({ code: res.code, expires: res.expires })
      setLogin({ account: res.account, invite: res.invite })
    })

  const remove = () => {
    const what = login?.account ? `${client.details.name}'s login` : 'the unused invite code'
    if (!window.confirm(`Remove ${what}? They won't be able to sign in until you send a new invite.`)) return
    run(async () => {
      setLogin(await removeClientLogin(client.id))
      setCode(null)
    })
  }

  const account = login?.account
  const pending = login?.invite

  return (
    <section id="client-login" className="rounded-2xl border border-border bg-surface p-5 md:p-6 mb-10 scroll-mt-24" aria-labelledby="client-login-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="client-login-heading" className="font-display font-bold text-xl">
            Client login
          </h2>
          <div className="text-sm text-text-secondary pt-1">
            {!login && !error && 'Loading...'}
            {account && (
              <>
                Active for <span className="text-text font-semibold break-all">{account.email}</span>
                {account.lastSignIn && ` · last signed in ${agoLabel(account.lastSignIn)}`}
              </>
            )}
            {login && !account && pending && `Invite code created, not used yet · expires ${dateLabel(pending.expires)}`}
            {login && !account && !pending && 'No login yet. Create an invite code and send it to your client.'}
          </div>
        </div>
        {login && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={invite}
              disabled={busy}
              className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold disabled:opacity-60"
            >
              {account ? 'Reset password' : pending ? 'New invite code' : 'Create invite code'}
            </button>
            {(account || pending) && (
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="h-11 px-4 text-sm font-semibold text-text-tertiary hover:text-orange disabled:opacity-60"
              >
                {account ? 'Remove login' : 'Cancel invite'}
              </button>
            )}
          </div>
        )}
      </div>
      {account && !code && (
        <p className="text-xs text-text-tertiary pt-3">
          Forgot their password? "Reset password" makes a new invite code. When they use it, they choose a new password.
        </p>
      )}
      {error && <p className="text-sm text-orange pt-3">{error}</p>}
      {code && <InviteCode client={client} code={code} />}
    </section>
  )
}

function InviteCode({ client, code }) {
  const [copied, setCopied] = useState('')
  const first = client.details.contact?.split(' ')[0]
  const message = `Hi${first ? ` ${first}` : ''}, your private progress page with LinoCon Digital is ready.

1. Go to https://linocondigital.com/clients
2. Tap "I have an invite code" and type: ${code.code}
3. Enter your email and choose a password.

The code works once and expires on ${dateLabel(code.expires)}. After that, sign in at the same page with your email and password.

On your page you can follow our progress, and read and sign your proposal and service agreement.

Lino
LinoCon Digital`

  const copy = (text, what) =>
    navigator.clipboard
      ?.writeText(text)
      .then(() => setCopied(what))
      .catch(() => window.prompt('Copy this:', text))

  return (
    <div className="mt-5 rounded-xl border border-blue bg-ink p-4 md:p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Invite code, shown once</p>
      <div className="font-mono text-2xl md:text-3xl tracking-widest pt-2 break-all">{code.code}</div>
      <p className="text-sm text-text-secondary pt-2">
        Send this to {client.details.name}. It works once and expires on {dateLabel(code.expires)}.
      </p>
      <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary font-sans">{message}</pre>
      <div className="pt-4">
        <EmailOptions
          to={client.details.email}
          subject="Your LinoCon Digital client page: how to sign in"
          body={message}
          label="Email invite"
          primary="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold flex items-center"
          secondary="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary"
        />
        {!client.details.email && <p className="text-xs text-text-tertiary pt-2">No email saved for this client, so type it in Gmail.</p>}
      </div>
      <div className="flex flex-wrap gap-3 pt-3">
        <button type="button" onClick={() => copy(message, 'message')} className="h-11 px-5 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary">
          {copied === 'message' ? 'Message copied' : 'Copy message'}
        </button>
        <button type="button" onClick={() => copy(code.code, 'code')} className="h-11 px-5 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary">
          {copied === 'code' ? 'Code copied' : 'Copy code only'}
        </button>
      </div>
    </div>
  )
}

// For the overview rows.
export function LoginChip({ login }) {
  const [label, tone] = login?.account
    ? ['Client login: active', 'border-blue text-blue']
    : login?.invite
      ? ['Client login: invited', 'border-orange text-orange']
      : ['Client login: none', 'border-border text-text-tertiary']
  return <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full border ${tone}`}>{label}</span>
}
