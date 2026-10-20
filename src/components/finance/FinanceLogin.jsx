import { useState } from 'react'
import Mark from '../Logo'
import { acceptInvite, sendCode, sendPassword } from '../../lib/finance'

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <Mark className="w-7 h-5" />
      <span className="font-display font-bold text-lg">LinoCon Digital</span>
      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-fin-muted border border-fin-line rounded-full px-2 py-px">
        Finance
      </span>
    </div>
  )
}

export function Card({ children, wide = false }) {
  return (
    <div className="fin-glow min-h-screen flex items-center justify-center px-4 py-10">
      <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-3xl border border-fin-line bg-fin-panel p-6 sm:p-8`}>
        <Brand />
        <div className="mt-7">{children}</div>
      </div>
    </div>
  )
}

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'
const button = 'w-full h-12 rounded-full fin-grad font-bold text-white disabled:opacity-60'

// Sign-in in two steps: the password, then a 6-digit code from an
// authenticator app. The first time, the app gets linked with a QR code and
// recovery codes are shown once. A bookkeeper's first sign-in starts from the
// invite code the owner gave them.
export default function FinanceLogin({ onSignedIn }) {
  const [step, setStep] = useState({ name: 'password' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(work) {
    setBusy(true)
    setError('')
    try {
      await work()
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
      if (err.code === 'expired') setStep({ name: 'password' })
    } finally {
      setBusy(false)
    }
  }

  if (step.name === 'password') {
    return (
      <PasswordStep
        busy={busy}
        error={error}
        onSubmit={(password) =>
          run(async () => {
            const res = await sendPassword(password)
            setStep({ name: res.link ? 'link' : 'code', ticket: res.ticket, setup: res.setup })
          })
        }
        onInvite={() => {
          setError('')
          setStep({ name: 'invite' })
        }}
      />
    )
  }

  if (step.name === 'invite') {
    return (
      <InviteStep
        busy={busy}
        error={error}
        onBack={() => {
          setError('')
          setStep({ name: 'password' })
        }}
        onSubmit={(code, password) =>
          run(async () => {
            const res = await acceptInvite(code, password)
            setStep({ name: 'link', ticket: res.ticket, setup: res.setup })
          })
        }
      />
    )
  }

  if (step.name === 'recovery') {
    return <RecoveryCodes codes={step.codes} onDone={onSignedIn} />
  }

  return (
    <CodeStep
      step={step}
      busy={busy}
      error={error}
      onBack={() => {
        setError('')
        setStep({ name: 'password' })
      }}
      onSubmit={(code) =>
        run(async () => {
          const res = await sendCode(step.ticket, code)
          if (res.recoveryCodes) setStep({ name: 'recovery', codes: res.recoveryCodes })
          else onSignedIn()
        })
      }
    />
  )
}

function PasswordStep({ onSubmit, onInvite, busy, error }) {
  const [password, setPassword] = useState('')
  return (
    <Card>
      <h1 className="font-display font-bold text-3xl">Sign in to your books</h1>
      <div className="text-sm text-fin-muted mt-2">linocondigital.com/finance · private, not linked from the website</div>
      <form
        className="mt-7 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (password) onSubmit(password)
        }}
      >
        <label className="flex flex-col gap-2 text-sm font-medium">
          Password
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </label>
        <p className="rounded-xl border border-fin-line bg-fin-panel-2/60 px-4 py-3 text-sm text-fin-muted">
          Next you'll type the 6-digit code from the authenticator app on your phone.
        </p>
        {error && <p className="text-sm text-fin-bad">{error}</p>}
        <button type="submit" disabled={busy} className={button}>
          {busy ? 'Checking...' : 'Sign in'}
        </button>
      </form>
      <div className="text-center text-xs text-fin-faint mt-5">Paused after 5 wrong tries · signs out after 30 minutes idle</div>
      <button type="button" onClick={onInvite} className="block mx-auto mt-4 text-sm text-fin-muted underline hover:text-text">
        Bookkeeper with an invite code?
      </button>
    </Card>
  )
}

function InviteStep({ onSubmit, onBack, busy, error }) {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [mismatch, setMismatch] = useState(false)
  return (
    <Card>
      <h1 className="font-display font-bold text-3xl">Set up your bookkeeper login</h1>
      <div className="text-sm text-fin-muted mt-2">Type the invite code the owner gave you, then choose your own password.</div>
      <form
        className="mt-7 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setMismatch(password !== again)
          if (code.trim() && password && password === again) onSubmit(code.trim(), password)
        }}
      >
        <label className="flex flex-col gap-2 text-sm font-medium">
          Invite code
          <input
            autoComplete="off"
            autoCapitalize="characters"
            autoFocus
            placeholder="ABCD-EFGH-JKLM"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${field} font-mono tracking-wider`}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Choose a password
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          <span className="text-xs font-normal text-fin-muted">At least 12 characters. A short sentence works well.</span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Type it again
          <input type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={field} />
        </label>
        {mismatch && <p className="text-sm text-fin-bad">The two passwords don’t match.</p>}
        {error && <p className="text-sm text-fin-bad">{error}</p>}
        <button type="submit" disabled={busy} className={button}>
          {busy ? 'Checking...' : 'Next: link your phone'}
        </button>
      </form>
      <button type="button" onClick={onBack} className="text-sm text-fin-muted hover:text-text mt-4">
        Back
      </button>
    </Card>
  )
}

function CodeStep({ step, onSubmit, onBack, busy, error }) {
  const [code, setCode] = useState('')
  const linking = step.name === 'link'
  return (
    <Card wide={linking}>
      {linking ? (
        <>
          <h1 className="font-display font-bold text-3xl">Link your phone</h1>
          <div className="text-fin-muted mt-2">This happens once. After this, signing in asks for a code from your phone.</div>
          <ol className="mt-6 flex flex-col gap-5 text-sm">
            <li>
              <b className="text-text">1. Get an authenticator app.</b>
              <span className="text-fin-muted"> Google Authenticator or Microsoft Authenticator, free in the App Store or Google Play.</span>
            </li>
            <li>
              <b className="text-text">2. In the app, tap + and scan this code.</b>
              <div className="mt-3 flex flex-col sm:flex-row gap-4 items-start">
                <div
                  className="w-44 h-44 shrink-0 rounded-xl bg-white p-2 [&>svg]:w-full [&>svg]:h-full"
                  role="img"
                  aria-label="QR code for your authenticator app"
                  dangerouslySetInnerHTML={{ __html: step.setup.qr }}
                />
                <p className="text-fin-muted">
                  Can't scan? Choose "Enter a setup key" and type:
                  <span className="block mt-2 font-mono text-text break-all tracking-wider">
                    {step.setup.secret.match(/.{1,4}/g).join(' ')}
                  </span>
                </p>
              </div>
            </li>
            <li>
              <b className="text-text">3. Type the 6-digit code the app shows.</b>
            </li>
          </ol>
        </>
      ) : (
        <>
          <h1 className="font-display font-bold text-3xl">Enter your code</h1>
          <div className="text-fin-muted mt-2">Open your authenticator app and type the 6-digit code for LinoCon Books.</div>
        </>
      )}
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (code.trim()) onSubmit(code.trim())
        }}
      >
        <input
          inputMode={linking ? 'numeric' : 'text'}
          autoComplete="one-time-code"
          autoFocus
          aria-label="6-digit code"
          placeholder="123 456"
          maxLength={linking ? 7 : 10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`${field} text-center text-2xl tracking-[0.3em] font-display`}
        />
        {error && <p className="text-sm text-fin-bad">{error}</p>}
        <button type="submit" disabled={busy} className={button}>
          {busy ? 'Checking...' : linking ? 'Link and sign in' : 'Sign in'}
        </button>
      </form>
      {!linking && <div className="text-xs text-fin-faint mt-4">Lost your phone? Type one of your recovery codes in the box instead. Bookkeepers can ask the owner for a new invite.</div>}
      <button type="button" onClick={onBack} className="text-sm text-fin-muted hover:text-text mt-4">
        Back
      </button>
    </Card>
  )
}

function RecoveryCodes({ codes, onDone }) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <Card wide>
      <h1 className="font-display font-bold text-3xl">Save your recovery codes</h1>
      <div className="text-fin-muted mt-2">
        If you lose your phone, each of these codes lets you sign in once instead of the 6-digit code. They won't be shown
        again, so write them down or print this page and keep it somewhere safe.
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-2 font-mono text-lg">
        {codes.map((c) => (
          <li key={c} className="rounded-lg bg-fin-panel-2 border border-fin-line py-2 text-center tracking-wider">
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(codes.join('\n')).then(() => setCopied(true))}
          className="h-10 px-5 rounded-full border border-fin-line text-sm font-semibold hover:bg-fin-panel-2"
        >
          {copied ? 'Copied' : 'Copy codes'}
        </button>
        <button type="button" onClick={() => window.print()} className="h-10 px-5 rounded-full border border-fin-line text-sm font-semibold hover:bg-fin-panel-2">
          Print
        </button>
      </div>
      <label className="mt-6 flex items-center gap-3 text-sm">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="w-5 h-5 accent-fin-blue" />
        I've saved these codes somewhere safe
      </label>
      <button type="button" disabled={!saved} onClick={onDone} className={`${button} mt-5`}>
        Open my books
      </button>
    </Card>
  )
}
