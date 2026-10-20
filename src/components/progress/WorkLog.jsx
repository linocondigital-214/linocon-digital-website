import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dateLabel, today } from '../../lib/clientProgress'
import { deleteLogChange, logChanges, newEntryId } from '../../lib/clientOverview'

// Lino's private work log: dated notes per client. Shown on /admin for every
// client and on each client's edit page. Never on the client's own page.

const inputClass = 'rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue [color-scheme:dark]'

// `clients` adds a "Client" picker (the overview). `onAdd(clientId, changes)`
// saves the note and resolves once it's saved.
export function WorkLogForm({ clients, onAdd }) {
  const [clientId, setClientId] = useState(clients?.[0]?.id ?? '')
  const [date, setDate] = useState(today)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || (clients && !clientId)) return
    setSaving(true)
    setError('')
    try {
      await onAdd(clientId, logChanges(newEntryId(), date || today(), text.trim()))
      setText('')
    } catch {
      setError("Couldn't save the note. Check your connection and try again.")
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-5 md:p-6 flex flex-col gap-4">
      <div className="grid sm:grid-cols-[1fr_auto] gap-4">
        {clients && (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">Client</span>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={`h-12 ${inputClass}`}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.details.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={`flex flex-col gap-2 ${clients ? '' : 'sm:col-start-2'}`}>
          <span className="text-sm font-semibold text-text-secondary">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`h-12 ${inputClass}`} />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-text-secondary">What did you do?</span>
        <textarea
          rows={3}
          value={text}
          maxLength={4000}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Updated opening hours, fixed the contact form, added 2 local citations."
          className={`py-3 resize-y ${inputClass}`}
        />
      </label>
      {error && <p className="text-orange text-sm">{error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add to log'}
        </button>
        <p className="text-xs text-text-tertiary">Only you see the work log. Never type passwords here.</p>
      </div>
    </form>
  )
}

// `entries` from logEntries(); `showClient` adds the client's name to each note.
export function WorkLogList({ entries, showClient, onDelete, limit = 10 }) {
  const [showAll, setShowAll] = useState(false)
  if (!entries.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-text-secondary">
        No notes yet. Add one each time you work on a client, and this becomes your log book.
      </p>
    )
  }
  const shown = showAll ? entries : entries.slice(0, limit)

  return (
    <div>
      <ol className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
        {shown.map((e) => (
          <li key={`${e.client.id}-${e.id}`} className="flex gap-4 p-4 md:p-5">
            <div className="hidden sm:block w-28 shrink-0 text-sm font-semibold text-text-secondary">{dateLabel(e.date)}</div>
            <div className="min-w-0 flex-1">
              <p className="sm:hidden text-xs font-semibold text-text-secondary">{dateLabel(e.date)}</p>
              {showClient && (
                <Link to={`/admin/${e.client.id}`} className="text-sm font-bold text-blue! hover:underline">
                  {e.client.details.name}
                </Link>
              )}
              <p className="whitespace-pre-line break-words">{e.text}</p>
            </div>
            <button
              type="button"
              onClick={() => window.confirm('Delete this note?') && onDelete(e.client.id, deleteLogChange(e.id))}
              className="self-start text-sm text-text-tertiary hover:text-orange"
              aria-label="Delete note"
            >
              Delete
            </button>
          </li>
        ))}
      </ol>
      {entries.length > limit && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 text-sm font-semibold text-text-secondary hover:text-text">
          {showAll ? 'Show fewer' : `Show all ${entries.length} notes`}
        </button>
      )}
    </div>
  )
}
