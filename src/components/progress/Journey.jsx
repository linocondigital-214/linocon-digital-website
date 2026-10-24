import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WISH_CHOICES, WISH_WHEN, hasWebsite, whenLabel, wishLabel } from '../../../api/_lib/wishes.js'
import { INTAKE } from '../../lib/clientChecklist'
import { askDocChanges, dateLabel, saveMyInfo, sendWishes, today } from '../../lib/clientProgress'
import { CONTACT_EMAIL, sendLead } from '../../lib/leads'
import { currentStep, journeySteps } from '../../lib/journey'
import { HasItem } from './ProgressBoard'

const card = 'rounded-2xl border border-border bg-surface p-5 md:p-6 mb-10 scroll-mt-24'
const chip = 'h-10 px-4 rounded-full border border-border text-sm font-semibold inline-flex items-center hover:border-text-tertiary'
const primary = 'h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold inline-flex items-center justify-center disabled:opacity-60'
const field = 'rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue text-text'

// Lets Lino know by email when a client does their part. Best effort: the
// answers are saved either way and show in /admin.
const tellLino = (client, what) => sendLead(`Client update: ${client.details.name} ${what}`, { Client: client.details.name, Update: what, Open: 'https://linocondigital.com/admin' })

function StepIcon({ step, current }) {
  if (step.done) return <span className="w-7 h-7 shrink-0 rounded-full bg-gradient-brand text-ink grid place-items-center text-sm font-bold">&#10003;</span>
  return (
    <span className={`w-7 h-7 shrink-0 rounded-full border-2 grid place-items-center text-xs font-bold ${current ? 'border-blue text-blue' : 'border-border text-text-tertiary'}`}>
      {step.n}
    </span>
  )
}

const numbered = (steps) => steps.map((s, i) => ({ ...s, n: i + 1 }))

// ---------- Lino's copy, at the top of each client in /admin ----------

export function JourneyCard({ client, onChange }) {
  const steps = numbered(journeySteps(client, { joined: client.joined, invited: client.invited }))
  const now = currentStep(steps)
  const base = `/admin/${client.id}`

  const actions = {
    invite: !client.joined && <a href="#client-login" className={chip}>Send the invite</a>,
    review: client.wishes?.site && (
      <a href={siteUrl(client.wishes.site)} target="_blank" rel="noreferrer" className={chip}>
        Open their website
      </a>
    ),
    package: <Link to={`${base}/package`} className={chip}>Open package builder</Link>,
    proposal: (
      <>
        <Link to={`${base}/package`} className={chip}>Package</Link>
        <Link to={`${base}/proposal`} className={chip}>Proposal</Link>
      </>
    ),
    agreement: <Link to={`${base}/agreement`} className={chip}>Open agreement</Link>,
    info: <Link to={`${base}/preview`} className={chip}>See their answers</Link>,
  }

  return (
    <section id="journey" className={card} aria-labelledby="journey-heading">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="journey-heading" className="font-display font-bold text-xl mr-auto">
          Client journey
        </h2>
        <span className="text-sm text-text-secondary">{now ? `Step ${now.n} of ${steps.length}: ${now.name}` : 'All steps done'}</span>
      </div>
      <ol className="mt-5 flex flex-col gap-3">
        {steps.map((s) => {
          const isNow = s === now
          return (
            <li key={s.key} className={`rounded-xl border p-4 flex gap-4 ${isNow ? 'border-blue bg-surface-2' : 'border-border'}`}>
              <StepIcon step={s} current={isNow} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className={`font-bold ${s.done || isNow ? '' : 'text-text-secondary'}`}>{s.name}</h3>
                  {isNow && <TurnBadge turn={s.turn} mine="Your turn" theirs="Client's turn" />}
                </div>
                <div className="text-sm text-text-secondary pt-1">{s.line}</div>
                {s.key === 'wishes' && client.wishes?.sentAt && <WishesSummary wishes={client.wishes} />}
                {s.key === 'proposal' && s.changes && (
                  <div className="mt-3 rounded-lg border border-orange/50 bg-orange/10 p-3 text-sm">
                    <div className="font-semibold">Client asked for changes on {dateLabel(s.changes.at)}</div>
                    <div className="pt-1 whitespace-pre-wrap">{s.changes.note}</div>
                    <div className="pt-2 text-text-secondary">Change the package or proposal, then mark it as Sent again.</div>
                    <button
                      type="button"
                      onClick={() => onChange(['package', 'proposal'].filter((d) => client.docs?.[d]?.changes).map((d) => ({ path: ['docs', d, 'changes'], value: null })))}
                      className="mt-2 text-sm font-semibold text-blue"
                    >
                      Mark as handled
                    </button>
                  </div>
                )}
                {s.key === 'start' && (
                  <label className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold text-text-secondary">Target launch date</span>
                    <input
                      type="date"
                      value={client.schedule?.launchOn || ''}
                      onChange={(e) => onChange([{ path: ['schedule', 'launchOn'], value: e.target.value || null }])}
                      className="h-10 rounded-lg bg-ink border border-border px-3 text-text [color-scheme:dark]"
                    />
                    <span className="text-text-tertiary">The client sees this on their page.</span>
                  </label>
                )}
                {!s.done && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {actions[s.key]}
                    <button type="button" onClick={() => onChange([{ path: ['journey', s.key], value: today() }])} className="h-10 px-3 text-sm font-semibold text-text-tertiary hover:text-text">
                      Mark done
                    </button>
                  </div>
                )}
                {s.manual && (
                  <button type="button" onClick={() => onChange([{ path: ['journey', s.key], value: null }])} className="mt-2 text-sm font-semibold text-text-tertiary hover:text-text">
                    Undo
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function TurnBadge({ turn, mine, theirs }) {
  const yours = turn === 'you'
  return (
    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${yours ? 'bg-orange/15 text-orange' : 'bg-blue/15 text-blue'}`}>
      {yours ? mine : theirs}
    </span>
  )
}

const siteUrl = (site) => (/^https?:\/\//i.test(site) ? site : `https://${site}`)

export function WishesSummary({ wishes }) {
  return (
    <ul className="mt-3 text-sm flex flex-col gap-1">
      <li>
        <span className="text-text-secondary">Has a website: </span>
        {wishes.hasSite === 'yes' ? `Yes${wishes.site ? `, ${wishes.site}` : ''}` : 'No'}
      </li>
      <li>
        <span className="text-text-secondary">Wants: </span>
        {Object.keys(wishes.picks ?? {}).map(wishLabel).join(', ')}
      </li>
      {wishes.when && (
        <li>
          <span className="text-text-secondary">When: </span>
          {whenLabel(wishes.when)}
        </li>
      )}
      {wishes.note && (
        <li className="whitespace-pre-wrap">
          <span className="text-text-secondary">Note: </span>
          {wishes.note}
        </li>
      )}
    </ul>
  )
}

// ---------- The client's copy, on linocondigital.com/clients ----------

const CLIENT_TEXT = {
  invite: ['Set up your login', 'Done. You can sign in any time.'],
  wishes: ['Tell us what you need', 'Thanks, we have your answers.'],
  review: ['We review your current website', 'Done.'],
  package: ['We pick the right package for you', 'Done.'],
  proposal: ['Review your package and proposal', 'You accepted them.'],
  agreement: ['Sign the service agreement', 'Signed by you and LinoCon Digital.'],
  info: ['Tell us what you already have', 'Thanks, we have your checklist.'],
  start: ['Pay the deposit, then we plan your launch', 'Your project has started.'],
}

export function ClientSteps({ client, onClient }) {
  const steps = numbered(journeySteps(client, { joined: true }))
  const now = currentStep(steps)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <section className={card} aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="font-display font-bold text-2xl">
        Your steps
      </h2>
      <div className="text-text-secondary pt-1">
        {now ? (now.turn === 'client' ? 'Your next step is below.' : 'Nothing to do right now. We are working on the next step.') : 'Every step is done.'}
      </div>
      {client.schedule?.launchOn && (
        <div className="mt-4 rounded-xl border border-blue/50 bg-blue/10 px-4 py-3 font-semibold">Target launch: {dateLabel(client.schedule.launchOn)}</div>
      )}
      <ol className="mt-5 flex flex-col gap-3">
        {steps.map((s) => {
          const isNow = s === now
          const [todo, doneText] = CLIENT_TEXT[s.key]
          const mine = isNow && s.turn === 'client'
          return (
            <li key={s.key} className={`rounded-xl border p-4 flex gap-4 ${isNow ? 'border-blue bg-surface-2' : 'border-border'}`}>
              <StepIcon step={s} current={isNow} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className={`font-bold ${s.done || isNow ? '' : 'text-text-secondary'}`}>{todo}</h3>
                  {isNow && <TurnBadge turn={s.turn === 'client' ? 'you' : 'us'} mine="Your turn" theirs="Our turn" />}
                </div>
                {s.done && <div className="text-sm text-text-secondary pt-1">{doneText}</div>}
                {s.key === 'wishes' && !s.done && <WishesForm client={client} onClient={onClient} />}
                {s.key === 'proposal' && mine && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/clients/package" className={chip}>Open your package</Link>
                    <Link to="/clients/proposal" className={chip}>Open your proposal</Link>
                  </div>
                )}
                {s.key === 'proposal' && isNow && s.changes && (
                  <div className="text-sm text-text-secondary pt-1">You asked for changes. We will update it and let you know.</div>
                )}
                {s.key === 'agreement' && mine && (
                  <div className="mt-3">
                    <Link to="/clients/agreement" className={primary}>Read and sign the agreement</Link>
                  </div>
                )}
                {s.key === 'agreement' && isNow && !mine && client.docs?.agreement?.status === 'signed' && (
                  <div className="text-sm text-text-secondary pt-1">Thanks for signing. LinoCon Digital signs next.</div>
                )}
                {s.key === 'info' && !s.done && (isNow || infoOpen) && <InfoForm client={client} onClient={onClient} />}
                {s.key === 'info' && !s.done && !isNow && !infoOpen && (
                  <button type="button" onClick={() => setInfoOpen(true)} className="mt-2 text-sm font-semibold text-blue">
                    Start it now
                  </button>
                )}
                {s.key === 'start' && isNow && s.turn === 'client' && client.payment?.link && (
                  <div className="text-sm text-text-secondary pt-1">Use the Pay button on this page to pay the deposit.</div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function WishesForm({ client, onClient }) {
  const [hasSite, setHasSite] = useState(client.wishes?.hasSite ?? '')
  const [site, setSite] = useState(client.wishes?.site ?? client.details?.website ?? '')
  const [picks, setPicks] = useState(Object.keys(client.wishes?.picks ?? {}))
  const [when, setWhen] = useState(client.wishes?.when ?? '')
  const [note, setNote] = useState(client.wishes?.note ?? '')
  const [state, setState] = useState({ status: 'idle' })

  const toggle = (id) => setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  async function send(e) {
    e.preventDefault()
    if (!hasSite) return setState({ status: 'error', message: 'Tell us whether you already have a website.' })
    if (!picks.length) return setState({ status: 'error', message: 'Tap at least one thing you want.' })
    setState({ status: 'saving' })
    try {
      const saved = await sendWishes({ hasSite, site, picks, when, note })
      tellLino(client, 'sent what they want')
      onClient(saved)
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  return (
    <form onSubmit={send} className="mt-4 flex flex-col gap-6">
      <fieldset>
        <legend className="font-semibold">Do you already have a website?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ['yes', 'Yes, I have one'],
            ['no', 'No, not yet'],
          ].map(([value, label]) => (
            <Choice key={value} on={hasSite === value} onClick={() => setHasSite(value)}>
              {label}
            </Choice>
          ))}
        </div>
        {hasSite === 'yes' && (
          <label className="mt-3 flex flex-col gap-2 text-sm font-semibold text-text-secondary">
            Its address
            <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="yourbusiness.ca" maxLength={200} className={`${field} h-12`} />
          </label>
        )}
      </fieldset>
      <fieldset>
        <legend className="font-semibold">What would you like help with? Tap all that fit.</legend>
        <div className="mt-2 grid sm:grid-cols-2 gap-2">
          {WISH_CHOICES.map((c) => (
            <Choice key={c.id} on={picks.includes(c.id)} onClick={() => toggle(c.id)} wide>
              {c.label}
            </Choice>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="font-semibold">When would you like to start?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {WISH_WHEN.map((w) => (
            <Choice key={w.id} on={when === w.id} onClick={() => setWhen(when === w.id ? '' : w.id)}>
              {w.label}
            </Choice>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Anything else we should know? (optional)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} className={`${field} py-3`} />
      </label>
      {state.status === 'error' && <p className="text-sm text-orange">{state.message}</p>}
      <div>
        <button type="submit" disabled={state.status === 'saving'} className={primary}>
          {state.status === 'saving' ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}

function Choice({ on, onClick, children, wide }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 px-4 py-2 rounded-xl border text-sm font-semibold text-left ${wide ? 'w-full' : ''} ${
        on ? 'border-blue bg-blue/15 text-text' : 'border-border text-text-secondary hover:border-text-tertiary'
      }`}
    >
      {on && <span aria-hidden="true">&#10003; </span>}
      {children}
    </button>
  )
}

// "What you already have", filled in by the client. Each tap saves.
function InfoForm({ client, onClient }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const has = client.has ?? {}

  async function save(changes) {
    const answers = changes.map(({ path, value }) => {
      const id = path[1]
      return id.endsWith('.note') ? { id: id.slice(0, -5), note: value ?? '' } : { id, value }
    })
    try {
      setError('')
      onClient(await saveMyInfo(answers))
    } catch (err) {
      setError(err.message)
    }
  }

  async function finish() {
    setBusy(true)
    try {
      const saved = await saveMyInfo([], true)
      tellLino(client, 'finished the "What you already have" checklist')
      onClient(saved)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="text-sm text-text-secondary">
        Tap Have, Don't have or Not sure for each one, and add a short note where it helps. Every answer saves as you go.
      </div>
      <div className="mt-3 rounded-xl border border-orange/50 bg-orange/10 p-4 text-sm">
        <b>Never type passwords here.</b>{' '}
        {hasWebsite(client)
          ? `For your website, domain and Google accounts, add ${CONTACT_EMAIL} as a manager or admin instead, and note here that you did.`
          : `Where we need access to an account, add ${CONTACT_EMAIL} as a manager or admin, and note here that you did.`}
      </div>
      <div className="mt-5 grid md:grid-cols-2 gap-x-10 gap-y-8">
        {INTAKE.map((g) => (
          <div key={g.id}>
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">{g.title}</h4>
            <ul className="flex flex-col gap-3">
              {g.items.map((i) => (
                <HasItem key={i.id} item={i} has={has} editable onChange={save} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-orange">{error}</p>}
      <div className="mt-6">
        <button type="button" onClick={finish} disabled={busy} className={primary}>
          {busy ? 'Sending...' : "I'm done, send it to LinoCon Digital"}
        </button>
      </div>
    </div>
  )
}

// Under a package or proposal the client hasn't accepted yet.
export function AskChanges({ client, docKey, docName, onClient }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [state, setState] = useState({ status: 'idle' })
  const asked = client.docs?.[docKey]?.changes

  async function send(e) {
    e.preventDefault()
    setState({ status: 'saving' })
    try {
      const saved = await askDocChanges(docKey, note)
      tellLino(client, `asked for changes to the ${docName.toLowerCase()}`)
      setOpen(false)
      setNote('')
      setState({ status: 'idle' })
      onClient(saved)
    } catch (err) {
      setState({ status: 'error', message: err.message })
    }
  }

  return (
    <div className="no-print max-w-3xl mx-auto mt-6 rounded-2xl border border-border bg-surface p-5 md:p-7">
      <h2 className="font-display font-bold text-xl">Not quite right?</h2>
      {asked ? (
        <div className="text-text-secondary pt-1">
          You asked for changes on {dateLabel(asked.at)}. We will update it and let you know.
          <div className="pt-2 text-text whitespace-pre-wrap">{asked.note}</div>
        </div>
      ) : (
        <div className="text-text-secondary pt-1">Tell us what you would like changed and we will send you an updated {docName.toLowerCase()}.</div>
      )}
      {open ? (
        <form onSubmit={send} className="mt-4 flex flex-col gap-3">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={2000} autoFocus className={`${field} py-3`} placeholder="For example: can we start with the website only?" />
          {state.status === 'error' && <p className="text-sm text-orange">{state.message}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={state.status === 'saving' || note.trim().length < 2} className={primary}>
              {state.status === 'saving' ? 'Sending...' : 'Send my changes'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 text-sm font-semibold text-text-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`${chip} mt-4`}>
          {asked ? 'Ask for more changes' : 'Ask for changes'}
        </button>
      )}
    </div>
  )
}
