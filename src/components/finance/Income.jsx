import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addIncome, centsToText, deleteIncome, editIncome, fetchIncome, money, monthTitle, shortDate, syncStripe, toCents } from '../../lib/finance'

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(new Date())

function shiftMonth(key, by) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const byDate = (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)

// /finance/income: Stripe payments (they come in on their own) and the form
// for money that didn't go through Stripe, like an e-Transfer.
export default function Income({ onChanged }) {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState({ status: 'loading' })
  const [month, setMonth] = useState(() => todayIso().slice(0, 7))
  const editing = params.get('add') ? 'new' : params.get('edit')

  useEffect(() => {
    fetchIncome()
      .then((d) => setData({ status: 'ready', ...d }))
      .catch(() => setData({ status: 'error' }))
  }, [])

  const close = () => setParams({}, { replace: true })

  // Asks Stripe for anything new, then reloads the list if something came in.
  async function checkStripe() {
    const stripe = await syncStripe(true)
    if (stripe.added) {
      const fresh = await fetchIncome()
      setData({ status: 'ready', ...fresh })
      onChanged()
    } else {
      setData((d) => ({ ...d, stripe }))
    }
  }

  if (data.status === 'loading') return <p className="text-fin-muted">Loading income...</p>
  if (data.status === 'error') return <p className="text-fin-muted">Couldn't load your income. Please refresh the page.</p>

  if (editing) {
    const income = editing === 'new' ? null : data.income.find((i) => i.id === editing)
    return (
      <IncomeForm
        key={editing}
        income={income}
        lists={data}
        onCancel={close}
        onSaved={(saved) => {
          setData((d) => ({ ...d, income: [saved, ...d.income.filter((i) => i.id !== saved.id)].sort(byDate) }))
          setMonth(saved.date.slice(0, 7))
          onChanged()
          close()
        }}
        onDeleted={(id) => {
          setData((d) => ({ ...d, income: d.income.filter((i) => i.id !== id) }))
          onChanged()
          close()
        }}
      />
    )
  }

  return (
    <IncomeList
      data={data}
      month={month}
      setMonth={setMonth}
      onCheck={checkStripe}
      onAdd={() => setParams({ add: '1' })}
      onOpen={(id) => setParams({ edit: id })}
    />
  )
}

function IncomeList({ data, month, setMonth, onCheck, onAdd, onOpen }) {
  const rows = data.income.filter((i) => i.date.startsWith(month))
  const total = rows.reduce((t, i) => t + i.amount, 0)
  const fees = rows.reduce((t, i) => t + (i.fee || 0), 0)
  const totals = new Map()
  for (const i of rows) totals.set(i.service, (totals.get(i.service) ?? 0) + i.amount)
  const byService = [...totals].sort((a, b) => b[1] - a[1])
  const thisMonth = todayIso().slice(0, 7)

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Money in</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">Income</h1>
        </div>
        <button type="button" onClick={onAdd} className="h-11 px-5 rounded-full border border-fin-line font-semibold hover:bg-fin-panel">
          Add a payment
        </button>
      </div>

      <StripeCard stripe={data.stripe} onCheck={onCheck} />

      <div className="mt-6 flex items-center gap-2">
        <button type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="w-10 h-10 rounded-full border border-fin-line hover:bg-fin-panel">
          ‹
        </button>
        <span className="font-display font-bold text-lg min-w-40 text-center">{monthTitle(month)}</span>
        <button
          type="button"
          aria-label="Next month"
          disabled={month >= thisMonth}
          onClick={() => setMonth(shiftMonth(month, 1))}
          className="w-10 h-10 rounded-full border border-fin-line hover:bg-fin-panel disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Tile label="Received" value={money(total)} />
        <Tile label="Payments" value={rows.filter((i) => !i.refund).length} />
        <Tile label="Stripe fees" value={money(fees)} />
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-6 text-fin-muted">
          No payments in {monthTitle(month)} yet. Card payments through Stripe appear here by themselves. For an e-Transfer or
          cash, tap <b className="text-text">Add a payment</b>.
        </div>
      ) : (
        <>
          <ul className="mt-6 rounded-2xl border border-fin-line bg-fin-panel divide-y divide-fin-line overflow-hidden">
            {rows.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => onOpen(i.id)} className="w-full text-left px-4 md:px-5 py-3.5 flex items-center gap-3 hover:bg-fin-panel-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${i.refund ? 'bg-fin-bad' : i.clientId ? 'bg-fin-good' : 'bg-fin-faint'}`} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{i.client}</span>
                    <span className="block text-sm text-fin-muted truncate">
                      {shortDate(i.date)} · {i.refund ? 'Refund' : i.service} · {i.source === 'stripe' ? 'Stripe' : i.receivedBy}
                    </span>
                  </span>
                  <span className={`tabular-nums font-semibold ${i.amount < 0 ? 'text-fin-bad' : ''}`}>{money(i.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-fin-line bg-fin-panel p-5">
            <h2 className="font-display font-bold text-lg">By service</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {byService.map(([name, amount]) => (
                <li key={name} className="flex justify-between gap-3">
                  <span className="text-fin-muted">{name}</span>
                  <span className="tabular-nums">{money(amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

function minutesAgo(ms) {
  const mins = Math.round((Date.now() - ms) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  return hours < 24 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`
}

function StripeCard({ stripe, onCheck }) {
  const [busy, setBusy] = useState(false)
  if (!stripe.connected) {
    return (
      <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel-2/60 px-5 py-4 text-sm text-fin-muted">
        <b className="text-text">Stripe isn’t connected yet.</b> Once its key is added in Vercel, card payments show up here on their
        own, matched to your clients, with Stripe’s fees added to expenses.
      </div>
    )
  }
  async function check() {
    setBusy(true)
    await onCheck().catch(() => {})
    setBusy(false)
  }
  return (
    <div className={`mt-6 rounded-2xl border bg-fin-panel px-5 py-4 flex flex-wrap items-center justify-between gap-3 ${stripe.error ? 'border-fin-warn/60' : 'border-fin-line'}`}>
      <div className="text-sm">
        <div className="font-semibold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stripe.error ? 'bg-fin-warn' : 'bg-fin-good'}`} />
          Stripe connected
        </div>
        <div className="text-fin-muted mt-0.5">
          {stripe.error ? stripe.error : stripe.lastSync ? `Checked for new payments ${minutesAgo(stripe.lastSync)}` : 'Not checked yet'}
        </div>
      </div>
      <button type="button" onClick={check} disabled={busy} className="h-10 px-4 rounded-full border border-fin-line text-sm font-semibold hover:bg-fin-panel-2 disabled:opacity-60">
        {busy ? 'Checking...' : 'Check now'}
      </button>
    </div>
  )
}

function Tile({ label, value }) {
  return (
    <div className="rounded-2xl border border-fin-line bg-fin-panel p-3 sm:p-4">
      <div className="text-xs sm:text-sm text-fin-muted">{label}</div>
      <div className="font-display font-bold text-lg sm:text-2xl mt-1 break-words">{value}</div>
    </div>
  )
}

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'
const OTHER = '__other'

function IncomeForm({ income, lists, onCancel, onSaved, onDeleted }) {
  const isNew = !income
  const fromStripe = income?.source === 'stripe'
  const [form, setForm] = useState(() => ({
    date: income?.date ?? todayIso(),
    amount: centsToText(income?.amount),
    gst: centsToText(income?.gst),
    clientId: income ? (income.clientId ?? OTHER) : (lists.clients[0]?.id ?? OTHER),
    client: income?.clientId ? '' : (income?.client ?? ''),
    service: income?.service ?? '',
    receivedBy: income?.receivedBy ?? lists.receivedBy[0],
    note: income?.note ?? '',
  }))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function save(e) {
    e.preventDefault()
    setError('')
    const labels = { ...form, clientId: form.clientId === OTHER ? null : form.clientId }
    let payload = labels
    if (!fromStripe) {
      const amount = toCents(form.amount)
      const gst = form.gst.trim() ? toCents(form.gst) : 0
      if (!amount) return setError('Type the amount you were paid, like 349.99.')
      if (gst === null) return setError('Type the GST as an amount, like 17.50, or leave it blank.')
      payload = { ...labels, amount, gst }
    }
    setSaving(true)
    try {
      onSaved(isNew ? await addIncome(payload) : await editIncome(income.id, payload))
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  async function remove() {
    setSaving(true)
    try {
      await deleteIncome(income.id)
      onDeleted(income.id)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const readOnly = !isNew && !lists.canEdit

  return (
    <form onSubmit={save} className="max-w-xl">
      <button type="button" onClick={onCancel} className="text-sm text-fin-muted hover:text-text">
        ‹ Back to income
      </button>
      <h1 className="font-display font-bold text-3xl pt-3">{isNew ? 'Add a payment' : income.refund ? 'Refund' : 'Payment'}</h1>
      {isNew && <div className="mt-2 text-fin-muted">For money that didn’t come through Stripe, like an e-Transfer or cash.</div>}

      {fromStripe && (
        <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-5 grid grid-cols-2 gap-4 text-sm">
          <Fact label={income.refund ? 'Refunded' : 'Received'} value={money(income.amount)} />
          <Fact label="Date" value={shortDate(income.date)} />
          <Fact label="Stripe fee" value={money(income.fee)} />
          <Fact label="GST collected" value={money(income.gst)} />
          <div className="col-span-2 text-fin-muted">From Stripe, so the amount and date stay as Stripe recorded them. You can fix the client or service below.</div>
        </div>
      )}

      <fieldset disabled={readOnly || saving} className="mt-6 flex flex-col gap-5">
        {!fromStripe && (
          <Label text="Amount received" hint={lists.gstRegistered ? 'Before GST. Put the GST in its own box below.' : null}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
              <input inputMode="decimal" placeholder="0.00" value={form.amount} onChange={set('amount')} className={`${field} pl-8 text-lg`} />
            </div>
          </Label>
        )}

        <Label text="Client">
          <select value={form.clientId} onChange={set('clientId')} className={field}>
            {lists.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value={OTHER}>Someone else</option>
          </select>
        </Label>
        {form.clientId === OTHER && (
          <Label text="Who paid you">
            <input value={form.client} onChange={set('client')} placeholder="Name or business" autoComplete="off" className={field} />
          </Label>
        )}

        <Label text="Service">
          <select value={form.service} onChange={set('service')} className={field}>
            <option value="" disabled>
              Choose a service
            </option>
            {lists.services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Label>

        {!fromStripe && (
          <div className="grid grid-cols-2 gap-4">
            <Label text="Date received">
              <input type="date" value={form.date} max={todayIso()} onChange={set('date')} className={field} />
            </Label>
            <Label text="Paid by">
              <select value={form.receivedBy} onChange={set('receivedBy')} className={field}>
                {lists.receivedBy.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Label>
          </div>
        )}

        {!fromStripe && lists.gstRegistered && (
          <Label text="GST charged (optional)">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
              <input inputMode="decimal" placeholder="0.00" value={form.gst} onChange={set('gst')} className={`${field} pl-8`} />
            </div>
          </Label>
        )}

        <Label text="Note (optional)">
          <input value={form.note} onChange={set('note')} placeholder="Like the invoice number" className={field} />
        </Label>
      </fieldset>

      {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}

      {!readOnly && (
        <div className="mt-6 flex flex-col gap-3">
          <button type="submit" disabled={saving} className="h-12 rounded-full fin-grad text-white font-bold disabled:opacity-60">
            {saving ? 'Saving...' : isNew ? 'Save payment' : 'Save changes'}
          </button>
          {!isNew && !fromStripe && lists.canDelete && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="h-11 text-sm text-fin-muted hover:text-fin-bad">
              Delete this payment
            </button>
          )}
          {confirmDelete && (
            <div className="rounded-2xl border border-fin-bad/50 p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Delete this payment?</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 px-4 rounded-full border border-fin-line text-sm">
                  Keep it
                </button>
                <button type="button" onClick={remove} disabled={saving} className="h-10 px-4 rounded-full bg-fin-bad text-white text-sm font-semibold">
                  Delete
                </button>
              </span>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <div className="text-fin-muted">{label}</div>
      <div className="font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  )
}

function Label({ text, hint, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {text}
      {children}
      {hint && <span className="text-xs font-normal text-fin-muted">{hint}</span>}
    </label>
  )
}
