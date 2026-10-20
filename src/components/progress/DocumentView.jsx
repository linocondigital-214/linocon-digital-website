import { useState } from 'react'
import {
  BUSINESS,
  DOCS,
  DOC_FIELDS,
  docSections,
  docState,
  docValues,
  fillTemplate,
  fieldLabel,
  selectedServices,
  statusLabel,
} from '../../lib/clientDocs'
import { dateLabel, today } from '../../lib/clientProgress'

// A proposal or service agreement, laid out as a printable page.
// Lino's copy (`editable`) adds the status, the fields to fill in and a way to
// reword any section for this client; none of that prints.
export default function DocumentView({ client, docKey, editable = false, onChange }) {
  const doc = DOCS[docKey]
  const state = docState(client, docKey)
  const values = docValues(client)
  const date = docKey === 'proposal' ? values.proposalDate : values.agreementDate

  return (
    <div>
      <div className="no-print max-w-3xl mx-auto flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => window.print()}
          className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold"
        >
          Print / Save as PDF
        </button>
        <span className="text-sm text-text-secondary">In the print window, choose "Save as PDF" to download it.</span>
      </div>

      {editable && <Controls client={client} docKey={docKey} onChange={onChange} />}

      <article className="print-paper bg-paper text-ink rounded-2xl p-6 sm:p-10 md:p-14 max-w-3xl mx-auto shadow-2xl">
        <header className="flex items-start justify-between gap-6 pb-6 border-b border-ink/15">
          <div className="flex items-center gap-3">
            <DocMark />
            <span className="font-display font-bold text-lg">{BUSINESS.name}</span>
          </div>
          <div className="text-right text-sm text-ink/60">
            <p>{BUSINESS.place}</p>
            <p>{BUSINESS.email}</p>
          </div>
        </header>

        <div className="py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">{doc.title}</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl mt-2 text-ink">{client.details.name}</h1>
          <p className="text-ink/60 mt-2">
            {date ? dateLabel(date) : <Blank editable={editable} field={docKey === 'proposal' ? 'proposalDate' : 'agreementDate'} />}
            {!editable && state.status === 'signed' && state.signedAt && (
              <> · {statusLabel(docKey, 'signed')} {dateLabel(state.signedAt)}</>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-7">
          {docSections(client, docKey).map((section) => (
            <Section
              key={section.id}
              section={section}
              client={client}
              docKey={docKey}
              values={values}
              editable={editable}
              onChange={onChange}
            />
          ))}
        </div>

        {doc.signatures && <Signatures values={values} editable={editable} />}

        <footer className="mt-12 pt-5 border-t border-ink/15 text-xs text-ink/50 flex flex-wrap justify-between gap-2">
          <span>
            {BUSINESS.name} · {BUSINESS.website}
          </span>
          <span>Get found. Get chosen. Get growing.</span>
        </footer>
      </article>
    </div>
  )
}

// Own gradient id: the page header's logo (hidden when printing) uses the
// shared one, and a gradient inside a hidden element doesn't paint.
export function DocMark() {
  return (
    <svg viewBox="0 0 30 24" fill="none" className="w-8 h-6" aria-hidden="true">
      <defs>
        <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E6BFF" />
          <stop offset="100%" stopColor="#FF6A3D" />
        </linearGradient>
      </defs>
      <path d="M2 20 L9 9" stroke="url(#docGradient)" strokeWidth="4" strokeLinecap="round" />
      <path d="M11 20 L18 5" stroke="url(#docGradient)" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 20 L28 2" stroke="url(#docGradient)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function Controls({ client, docKey, onChange }) {
  const state = docState(client, docKey)
  const services = client.details.services ?? {}
  const fields = DOC_FIELDS.filter((f) => f.doc === docKey && (!f.service || services[f.service]))
  const set = (path, value) => onChange([{ path: ['docs', docKey, ...path], value }])

  return (
    <div className="no-print max-w-3xl mx-auto mb-8 flex flex-col gap-4">
      <StatusCard client={client} docKey={docKey} onChange={onChange} />

      {docKey === 'agreement' && (
        <p className="rounded-2xl border border-orange/40 bg-orange/10 p-5 text-sm">
          This agreement is a starting template, not legal advice. Have a BC lawyer review it once before you use it with
          clients, then update the wording here to match.
        </p>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
        <p className="font-bold">Fill in</p>
        <p className="text-sm text-text-secondary mt-1">
          Anything left empty prints as a blank line. {docKey === 'agreement' && 'Prices come from the proposal.'}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {fields.map((f) => (
            <FieldInput key={f.key} field={f} value={state.fields?.[f.key] ?? ''} onSave={(v) => set(['fields', f.key], v || null)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Draft / Sent / Signed for one document. Not printed.
export function StatusCard({ client, docKey, onChange }) {
  const doc = DOCS[docKey]
  const state = docState(client, docKey)
  const status = state.status || 'draft'
  const set = (path, value) => onChange([{ path: ['docs', docKey, ...path], value }])

  function setStatus(next) {
    const changes = [{ path: ['docs', docKey, 'status'], value: next }]
    if (next !== 'draft' && !state.sentAt) changes.push({ path: ['docs', docKey, 'sentAt'], value: today() })
    if (next === 'signed' && !state.signedAt) changes.push({ path: ['docs', docKey, 'signedAt'], value: today() })
    onChange(changes)
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <p className="font-bold">Status</p>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {doc.statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-pressed={status === s.value}
            onClick={() => setStatus(s.value)}
            className={`h-10 px-4 rounded-full text-sm font-bold border ${
              status === s.value ? 'bg-gradient-brand text-ink border-transparent' : 'border-border text-text-secondary hover:border-text-tertiary'
            }`}
          >
            {s.label}
          </button>
        ))}
        {status === 'signed' && (
          <label className="flex items-center gap-2 text-sm text-text-secondary ml-2">
            {statusLabel(docKey, 'signed')} on
            <input
              type="date"
              value={state.signedAt || ''}
              onChange={(e) => set(['signedAt'], e.target.value || null)}
              className="h-10 rounded-lg bg-ink border border-border px-3 text-text [color-scheme:dark]"
            />
          </label>
        )}
      </div>
      <p className="text-sm text-text-secondary mt-3">
        {status === 'draft'
          ? 'Drafts are private. The client sees this on their page once you mark it as sent.'
          : `The client can see this on their page${state.sentAt ? ` (sent ${dateLabel(state.sentAt)})` : ''}.`}
      </p>
    </div>
  )
}

function FieldInput({ field, value, onSave }) {
  const [draft, setDraft] = useState(value)
  const save = () => draft !== value && onSave(draft.trim())
  const className = 'rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue [color-scheme:dark]'
  return (
    <label className={`flex flex-col gap-2 ${field.multiline ? 'sm:col-span-2' : ''}`}>
      <span className="text-sm font-semibold text-text-secondary">{field.label}</span>
      {field.multiline ? (
        <textarea rows={3} value={draft} placeholder={field.placeholder} onChange={(e) => setDraft(e.target.value)} onBlur={save} className={`${className} py-3`} />
      ) : field.type === 'date' ? (
        <input
          type="date"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            onSave(e.target.value || '')
          }}
          className={`${className} h-12`}
        />
      ) : (
        <input type="text" value={draft} placeholder={field.placeholder} onChange={(e) => setDraft(e.target.value)} onBlur={save} className={`${className} h-12`} />
      )}
    </label>
  )
}

function Section({ section, client, docKey, values, editable, onChange }) {
  const custom = docState(client, docKey).text?.[section.id]
  const template = custom ?? section.text
  const [editing, setEditing] = useState(false)

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display font-bold text-xl text-ink">{section.title}</h2>
        {editable && !section.auto && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="no-print text-sm font-semibold text-blue">
            Edit wording
          </button>
        )}
      </div>
      <div className="mt-2 text-ink/80 leading-relaxed">
        {section.auto === 'scope' && <Scope client={client} />}
        {section.auto === 'prices' && <Prices client={client} values={values} editable={editable} />}
        {!section.auto &&
          (editing ? (
            <Editor
              template={template}
              isCustom={custom != null}
              onCancel={() => setEditing(false)}
              onSave={(text) => {
                onChange([{ path: ['docs', docKey, 'text', section.id], value: text }])
                setEditing(false)
              }}
              onReset={() => {
                onChange([{ path: ['docs', docKey, 'text', section.id], value: null }])
                setEditing(false)
              }}
            />
          ) : (
            <Filled template={template} values={values} editable={editable} />
          ))}
      </div>
    </section>
  )
}

function Filled({ template, values, editable }) {
  return template.split('\n').map((line, i) => (
    <p key={i} className={i ? 'mt-2' : ''}>
      {fillTemplate(line, values, dateLabel).map((part, j) =>
        part.field ? (
          part.value ? (
            <span key={j}>{part.value}</span>
          ) : (
            <Blank key={j} field={part.field} editable={editable} />
          )
        ) : (
          <span key={j}>{part.text}</span>
        ),
      )}
    </p>
  ))
}

// An empty field: highlighted on Lino's screen, a blank line on paper and for clients.
function Blank({ field, editable }) {
  return (
    <>
      {editable && <mark className="no-print bg-orange/25 text-ink rounded px-1">{fieldLabel(field)}</mark>}
      <span className={`${editable ? 'print-only' : 'inline-block'} w-32 border-b border-ink/40 align-baseline`}>&nbsp;</span>
    </>
  )
}

function Editor({ template, isCustom, onSave, onCancel, onReset }) {
  const [draft, setDraft] = useState(template)
  return (
    <div className="no-print flex flex-col gap-3">
      <textarea
        rows={Math.max(4, Math.ceil(draft.length / 70))}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="rounded-xl bg-white border border-ink/20 p-3 text-ink outline-none focus:border-blue"
      />
      <p className="text-xs text-ink/60">Words in {'{{ }}'} fill in automatically. This change only applies to this client.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onSave(draft.trim())} className="h-10 px-4 rounded-full bg-ink text-paper text-sm font-bold">
          Save
        </button>
        <button type="button" onClick={onCancel} className="h-10 px-4 rounded-full border border-ink/20 text-sm font-semibold">
          Cancel
        </button>
        {isCustom && (
          <button type="button" onClick={onReset} className="h-10 px-4 text-sm font-semibold text-ink/60">
            Reset to template
          </button>
        )}
      </div>
    </div>
  )
}

function Scope({ client }) {
  const services = selectedServices(client)
  if (!services.length) return <p>No services selected yet.</p>
  return (
    <ul className="flex flex-col gap-3">
      {services.map((s) => (
        <li key={s.key}>
          <strong className="text-ink">{s.name}.</strong> {s.scope}
        </li>
      ))}
    </ul>
  )
}

function Prices({ client, values, editable }) {
  const services = selectedServices(client)
  return (
    <table className="w-full text-left">
      <tbody className="divide-y divide-ink/10">
        {services.map((s) => (
          <tr key={s.key}>
            <td className="py-2.5 pr-4">{s.name}</td>
            <td className="py-2.5 text-right font-semibold text-ink">
              {values[s.priceField] || <Blank field={s.priceField} editable={editable} />}
            </td>
          </tr>
        ))}
        {values.packageExtras?.split('\n').filter(Boolean).map((line) => {
          const at = line.lastIndexOf(': ')
          return (
            <tr key={line}>
              <td className="py-2.5 pr-4">{at > 0 ? line.slice(0, at) : line}</td>
              <td className="py-2.5 text-right font-semibold text-ink whitespace-nowrap">{at > 0 ? line.slice(at + 2) : ''}</td>
            </tr>
          )
        })}
        <tr>
          <td className="py-2.5 pr-4 font-bold text-ink">Total</td>
          <td className="py-2.5 text-right font-bold text-ink">{values.total || <Blank field="total" editable={editable} />}</td>
        </tr>
      </tbody>
    </table>
  )
}

function Signatures({ values, editable }) {
  const line = (label) => (
    <div>
      <div className="h-10 border-b border-ink/40" />
      <p className="text-xs text-ink/60 mt-1">{label}</p>
    </div>
  )
  return (
    <section className="print-keep mt-10 pt-8 border-t border-ink/15">
      <h2 className="font-display font-bold text-xl text-ink">Signatures</h2>
      <p className="text-ink/70 mt-2">By signing, both parties agree to the terms above.</p>
      <div className="grid sm:grid-cols-2 gap-10 mt-6">
        <div className="flex flex-col gap-4">
          <p className="font-bold text-ink">{BUSINESS.name}</p>
          {line('Signature')}
          {line('Name and title')}
          {line('Date')}
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-bold text-ink">
            {values.business}
            {values.clientSigner ? `: ${values.clientSigner}` : ''}
          </p>
          {line('Signature')}
          {line(values.clientSigner ? 'Name and title (as above)' : 'Name and title')}
          {line('Date')}
        </div>
      </div>
      {editable && !values.clientSigner && (
        <p className="no-print text-sm text-ink/50 mt-4">Tip: add the client signer's name under "Fill in".</p>
      )}
    </section>
  )
}
