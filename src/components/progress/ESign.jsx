import { useState } from 'react'
import { signDocument } from '../../lib/clientProgress'

export const signedAtLabel = (iso) =>
  `${new Date(iso).toLocaleString('en-CA', { timeZone: 'America/Vancouver', dateStyle: 'medium', timeStyle: 'short' })} Pacific`

// A typed name shown as a signature.
export function SignatureName({ name }) {
  return <div className="font-[cursive] italic text-3xl text-ink leading-tight break-words">{name}</div>
}

// "Signed electronically by ..." under a document, on screen and on paper.
export function SignedBy({ esign, verb = 'Signed' }) {
  return (
    <div>
      <SignatureName name={esign.name} />
      <div className="text-xs text-ink/60 pt-1">
        {verb} electronically by {esign.name} on {signedAtLabel(esign.at)}
        {esign.fingerprint && <> · Record {esign.fingerprint}</>}
      </div>
    </div>
  )
}

// Acceptance block for the package and proposal, which have no signature lines.
export function AcceptedBlock({ esign, title }) {
  if (!esign) return null
  return (
    <section className="print-keep mt-10 pt-8 border-t border-ink/15">
      <h2 className="font-display font-bold text-xl text-ink">Accepted</h2>
      <div className="text-ink/70 pt-2 pb-4">The client accepted this {title.toLowerCase()} online.</div>
      <SignedBy esign={esign} verb="Accepted" />
    </section>
  )
}

// The client's sign box under a document Lino has sent. Not printed.
export function SignBox({ docKey, docName, onSigned }) {
  const isAgreement = docKey === 'agreement'
  const action = isAgreement ? 'Sign' : 'Accept'
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [state, setState] = useState({ status: 'idle' })

  async function submit(e) {
    e.preventDefault()
    if (name.trim().length < 2) return setState({ status: 'error', message: 'Type your full name.' })
    if (!agree) return setState({ status: 'error', message: 'Tick the box to agree first.' })
    setState({ status: 'saving' })
    try {
      onSigned(await signDocument(docKey, name, true))
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  return (
    <form onSubmit={submit} className="no-print max-w-3xl mx-auto mt-8 rounded-2xl border border-blue/50 bg-surface p-5 md:p-7 flex flex-col gap-4">
      <div>
        <h2 className="font-display font-bold text-2xl">
          {action} this {docName.toLowerCase()}
        </h2>
        <div className="text-text-secondary pt-1">
          {isAgreement
            ? 'Read the agreement above. When you are ready, type your full name and tick the box. That is your electronic signature.'
            : `Happy with this ${docName.toLowerCase()}? Type your full name and tick the box to accept it.`}
        </div>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-text-secondary">Your full name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={100}
          className="h-12 rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue"
        />
      </label>
      {name.trim().length >= 2 && (
        <div className="rounded-xl bg-paper px-5 py-4">
          <SignatureName name={name.trim()} />
        </div>
      )}
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-5 h-5 mt-0.5 accent-blue shrink-0" />
        <span className="text-sm">
          I have read and agree to this {docName.toLowerCase()}. I understand that typing my name and clicking "{action}" is my electronic
          signature, the same as signing on paper.
        </span>
      </label>
      {state.status === 'error' && (
        <div className="text-sm text-orange" role="alert">
          {state.message}
        </div>
      )}
      <button
        type="submit"
        disabled={state.status === 'saving'}
        className="h-12 px-6 rounded-full bg-gradient-brand text-ink font-bold w-full sm:w-fit disabled:opacity-60"
      >
        {state.status === 'saving' ? 'Saving...' : `${action} ${docName.toLowerCase()}`}
      </button>
      <div className="text-xs text-text-secondary">We save your name, the date and time, and a record of this exact version.</div>
    </form>
  )
}
