import { useRef, useState } from 'react'
import { signDocument } from '../../lib/clientProgress'

export const signedAtLabel = (iso) =>
  `${new Date(iso).toLocaleString('en-CA', { timeZone: 'America/Vancouver', dateStyle: 'medium', timeStyle: 'short' })} Pacific`

// A typed name shown as a signature.
export function SignatureName({ name }) {
  return <div className="font-[cursive] italic text-3xl text-ink leading-tight break-words">{name}</div>
}

// A drawn signature: an SVG path on a 600 x 200 box.
export function SignatureDrawing({ d, className = 'h-16' }) {
  return (
    <svg viewBox="0 0 600 200" className={`${className} w-auto max-w-full`} role="img" aria-label="Drawn signature">
      <path d={d} fill="none" stroke="#111318" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// "Signed electronically by ..." under a document, on screen and on paper.
export function SignedBy({ esign, verb = 'Signed' }) {
  return (
    <div>
      {esign.drawing ? <SignatureDrawing d={esign.drawing} /> : <SignatureName name={esign.name} />}
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

const MAX_DRAWING = 20000

// Draw with a finger, pen or mouse. Calls onChange with the SVG path, or ''
// when cleared. Points closer than 3 units are skipped to keep it small.
export function SignaturePad({ value, onChange }) {
  const svg = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [d, setD] = useState(value || '')

  function point(e) {
    const box = svg.current.getBoundingClientRect()
    return [Math.round(((e.clientX - box.left) / box.width) * 600), Math.round(((e.clientY - box.top) / box.height) * 200)]
  }
  function down(e) {
    e.preventDefault()
    svg.current.setPointerCapture?.(e.pointerId)
    drawing.current = true
    const [x, y] = point(e)
    last.current = [x, y]
    setD((cur) => `${cur}M${x} ${y}L${x} ${y + 0.1}`.slice(0, MAX_DRAWING))
  }
  function move(e) {
    if (!drawing.current) return
    const [x, y] = point(e)
    const [lx, ly] = last.current
    if (Math.abs(x - lx) + Math.abs(y - ly) < 3) return
    last.current = [x, y]
    setD((cur) => (cur.length + 12 > MAX_DRAWING ? cur : `${cur}L${x} ${y}`))
  }
  function up() {
    if (!drawing.current) return
    drawing.current = false
    setD((cur) => {
      onChange(cur)
      return cur
    })
  }

  return (
    <div>
      <div className="relative rounded-xl bg-paper overflow-hidden">
        <svg
          ref={svg}
          viewBox="0 0 600 200"
          className="w-full aspect-[3/1] touch-none cursor-crosshair select-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        >
          <line x1="40" y1="160" x2="560" y2="160" stroke="#111318" strokeOpacity="0.2" strokeWidth="2" />
          <path d={d} fill="none" stroke="#111318" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!d && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-ink/40 text-sm">Sign here</span>}
      </div>
      <button
        type="button"
        onClick={() => {
          setD('')
          onChange('')
        }}
        className="mt-2 text-sm font-semibold text-text-secondary hover:text-text"
      >
        Clear
      </button>
    </div>
  )
}

// Type or Draw switch for the sign boxes.
export function SignMode({ mode, setMode, dark = true }) {
  const base = 'h-9 px-4 rounded-full text-sm font-bold border'
  const on = 'bg-gradient-brand text-ink border-transparent'
  const off = dark ? 'border-border text-text-secondary' : 'border-ink/20 text-ink/60'
  return (
    <div className="flex gap-2" role="group" aria-label="How to sign">
      {['type', 'draw'].map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`${base} ${mode === m ? on : off}`}>
          {m === 'type' ? 'Type' : 'Draw'}
        </button>
      ))}
    </div>
  )
}

// The client's sign box under a document Lino has sent. Not printed.
export function SignBox({ docKey, docName, onSigned }) {
  const isAgreement = docKey === 'agreement'
  const action = isAgreement ? 'Sign' : 'Accept'
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [mode, setMode] = useState('type')
  const [drawing, setDrawing] = useState('')
  const [state, setState] = useState({ status: 'idle' })

  async function submit(e) {
    e.preventDefault()
    if (name.trim().length < 2) return setState({ status: 'error', message: 'Type your full name.' })
    if (mode === 'draw' && !drawing) return setState({ status: 'error', message: 'Draw your signature in the box, or choose Type.' })
    if (!agree) return setState({ status: 'error', message: 'Tick the box to agree first.' })
    setState({ status: 'saving' })
    try {
      onSigned(await signDocument(docKey, name, true, mode === 'draw' ? drawing : null))
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
            ? 'Read the agreement above. When you are ready, type your full name, sign by typing or drawing, and tick the box.'
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
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-text-secondary">Your signature</span>
        <SignMode mode={mode} setMode={setMode} />
        {mode === 'draw' ? (
          <SignaturePad value={drawing} onChange={setDrawing} />
        ) : (
          <div className="rounded-xl bg-paper px-5 py-4 min-h-16">
            {name.trim().length >= 2 ? <SignatureName name={name.trim()} /> : <span className="text-ink/40 text-sm">Your typed name shows here</span>}
          </div>
        )}
      </div>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-5 h-5 mt-0.5 accent-blue shrink-0" />
        <span className="text-sm">
          I have read and agree to this {docName.toLowerCase()}. I understand that signing here and clicking "{action}" is my electronic signature, the same as
          signing on paper.
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
