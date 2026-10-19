import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addExpense,
  centsToText,
  deleteExpense,
  editExpense,
  fetchExpenses,
  fetchReceipt,
  money,
  monthTitle,
  shortDate,
  shrinkPhoto,
  suggestFor,
  toCents,
} from '../../lib/finance'

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(new Date())

function shiftMonth(key, by) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// /finance/expenses: the month's expenses, and the form to add one with a
// receipt photo. ?add=1 (the phone's + button) opens the form straight away.
export default function Expenses({ onChanged }) {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState({ status: 'loading' })
  const [month, setMonth] = useState(() => todayIso().slice(0, 7))
  const editing = params.get('add') ? 'new' : params.get('edit')

  useEffect(() => {
    fetchExpenses()
      .then((d) => setData({ status: 'ready', ...d }))
      .catch(() => setData({ status: 'error' }))
  }, [])

  const close = () => setParams({}, { replace: true })

  if (data.status === 'loading') return <p className="text-fin-muted">Loading expenses...</p>
  if (data.status === 'error') return <p className="text-fin-muted">Couldn't load your expenses. Please refresh the page.</p>

  if (editing) {
    const expense = editing === 'new' ? null : data.expenses.find((e) => e.id === editing)
    return (
      <ExpenseForm
        key={editing}
        expense={expense}
        lists={data}
        onCancel={close}
        onSaved={(saved) => {
          setData((d) => ({ ...d, expenses: [saved, ...d.expenses.filter((e) => e.id !== saved.id)].sort(byDate) }))
          setMonth(saved.date.slice(0, 7))
          onChanged()
          close()
        }}
        onDeleted={(id) => {
          setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }))
          onChanged()
          close()
        }}
      />
    )
  }

  return <ExpenseList data={data} month={month} setMonth={setMonth} onAdd={() => setParams({ add: '1' })} onOpen={(id) => setParams({ edit: id })} />
}

// Stripe's monthly fees come from Stripe's own records, so they need no photo.
const needsReceipt = (e) => !e.receipt && e.source !== 'stripe'

const byDate = (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)

function ExpenseList({ data, month, setMonth, onAdd, onOpen }) {
  const rows = data.expenses.filter((e) => e.date.startsWith(month))
  const total = rows.reduce((t, e) => t + e.amount, 0)
  const missing = rows.filter(needsReceipt).length
  const totals = new Map()
  for (const e of rows) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  const byCategory = [...totals].sort((a, b) => b[1] - a[1])
  const thisMonth = todayIso().slice(0, 7)

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Money out</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">Expenses</h1>
        </div>
        <button type="button" onClick={onAdd} className="h-11 px-5 rounded-full fin-grad text-white font-semibold">
          Add expense
        </button>
      </div>

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
        <Tile label="Spent this month" value={money(total)} />
        <Tile label="Expenses" value={rows.length} />
        <Tile label="Missing receipts" value={missing} warn={missing > 0} />
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-6 text-fin-muted">
          No expenses in {monthTitle(month)} yet. Tap <b className="text-text">Add expense</b> and take a photo of the receipt.
        </div>
      ) : (
        <>
          <ul className="mt-6 rounded-2xl border border-fin-line bg-fin-panel divide-y divide-fin-line overflow-hidden">
            {rows.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => onOpen(e.id)} className="w-full text-left px-4 md:px-5 py-3.5 flex items-center gap-3 hover:bg-fin-panel-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${needsReceipt(e) ? 'bg-fin-warn' : 'bg-fin-good'}`}
                    title={needsReceipt(e) ? 'No receipt yet' : 'Receipt saved'}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{e.vendor}</span>
                    <span className="block text-sm text-fin-muted truncate">
                      {shortDate(e.date)} · {e.category}
                      {needsReceipt(e) && ' · no receipt'}
                      {e.source === 'stripe' && ' · from Stripe'}
                    </span>
                  </span>
                  <span className="tabular-nums font-semibold">{money(e.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-fin-line bg-fin-panel p-5">
            <h2 className="font-display font-bold text-lg">By category</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {byCategory.map(([name, amount]) => (
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

function Tile({ label, value, warn = false }) {
  return (
    <div className={`rounded-2xl border bg-fin-panel p-3 sm:p-4 ${warn ? 'border-fin-warn/50' : 'border-fin-line'}`}>
      <div className="text-xs sm:text-sm text-fin-muted">{label}</div>
      <div className={`font-display font-bold text-lg sm:text-2xl mt-1 break-words ${warn ? 'text-fin-warn' : ''}`}>{value}</div>
    </div>
  )
}

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'

function ExpenseForm({ expense, lists, onCancel, onSaved, onDeleted }) {
  const isNew = !expense
  const [form, setForm] = useState(() => ({
    date: expense?.date ?? todayIso(),
    vendor: expense?.vendor ?? '',
    amount: centsToText(expense?.amount),
    gst: centsToText(expense?.gst),
    category: expense?.category ?? '',
    paidWith: expense?.paidWith ?? lists.paidWith[0],
    note: expense?.note ?? '',
  }))
  // 'auto' while the category is the app's suggestion; 'picked' once Lino chooses.
  const [categoryFrom, setCategoryFrom] = useState(isNew ? null : 'picked')
  const [photo, setPhoto] = useState({ dataUrl: null, existing: expense?.receipt ?? false, removed: false, busy: false })
  const [existingUrl, setExistingUrl] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileInput = useRef(null)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    if (expense?.receipt) fetchReceipt(expense.id).then(setExistingUrl).catch(() => {})
  }, [expense])

  // Suggest a category once the vendor is typed, unless Lino already picked one.
  async function suggest() {
    if (!form.vendor.trim() || categoryFrom === 'picked') return
    const s = await suggestFor(form.vendor).catch(() => null)
    if (s) {
      setForm((f) => ({ ...f, category: s.category }))
      setCategoryFrom(s.from)
    }
  }

  async function choosePhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhoto((p) => ({ ...p, busy: true }))
    try {
      const dataUrl = await shrinkPhoto(file)
      setPhoto({ dataUrl, existing: false, removed: false, busy: false })
    } catch (err) {
      setError(err.message)
      setPhoto((p) => ({ ...p, busy: false }))
    }
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    const amount = toCents(form.amount)
    const gst = form.gst.trim() ? toCents(form.gst) : 0
    if (!amount) return setError('Type the amount you paid, like 24.99.')
    if (gst === null) return setError('Type the GST/HST part as an amount, like 1.19, or leave it blank.')
    const payload = { ...form, amount, gst }
    setSaving(true)
    try {
      const saved = isNew
        ? await addExpense(payload, photo.dataUrl)
        : await editExpense(expense.id, payload, photo.dataUrl, photo.removed)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  async function remove() {
    setSaving(true)
    try {
      await deleteExpense(expense.id)
      onDeleted(expense.id)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const shown = photo.dataUrl ?? (photo.existing && !photo.removed ? existingUrl : null)
  const hasPhoto = Boolean(photo.dataUrl) || (photo.existing && !photo.removed)
  const fromStripe = expense?.source === 'stripe'
  const readOnly = (!isNew && !lists.canEdit) || fromStripe

  return (
    <form onSubmit={save} className="max-w-xl">
      <button type="button" onClick={onCancel} className="text-sm text-fin-muted hover:text-text">
        ‹ Back to expenses
      </button>
      <h1 className="font-display font-bold text-3xl pt-3">{isNew ? 'Add expense' : 'Expense'}</h1>
      {fromStripe && (
        <div className="mt-3 text-sm text-fin-muted">
          These are the fees Stripe kept from your payments this month. The app adds them and keeps them up to date, so there’s
          nothing to change here.
        </div>
      )}

      <fieldset disabled={readOnly || saving} className="mt-6 flex flex-col gap-5">
        {!fromStripe && (
        <div>
          <input ref={fileInput} type="file" accept="image/*" capture="environment" onChange={choosePhoto} className="hidden" />
          {hasPhoto ? (
            <div className="rounded-2xl border border-fin-line bg-fin-panel p-3 flex gap-4 items-center">
              {shown ? (
                <a href={shown} target="_blank" rel="noreferrer" className="shrink-0">
                  <img src={shown} alt="Receipt" className="w-20 h-24 object-cover rounded-lg bg-white" />
                </a>
              ) : (
                <span className="w-20 h-24 rounded-lg bg-fin-panel-2 shrink-0" />
              )}
              <div className="flex flex-col gap-2 text-sm">
                <span className="font-semibold text-fin-good">Receipt photo added</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => fileInput.current.click()} className="underline text-fin-muted hover:text-text">
                    Retake
                  </button>
                  <button type="button" onClick={() => setPhoto({ dataUrl: null, existing: photo.existing, removed: true, busy: false })} className="underline text-fin-muted hover:text-text">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current.click()}
              className="w-full rounded-2xl border border-dashed border-fin-line bg-fin-panel hover:bg-fin-panel-2 py-6 flex flex-col items-center gap-1"
            >
              <span className="font-semibold">{photo.busy ? 'Getting the photo ready...' : 'Take a photo of the receipt'}</span>
              <span className="text-sm text-fin-muted">or choose one from your photos</span>
            </button>
          )}
        </div>
        )}

        <Label text="Amount paid (total)">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
            <input inputMode="decimal" placeholder="0.00" value={form.amount} onChange={set('amount')} className={`${field} pl-8 text-lg`} />
          </div>
        </Label>

        <Label text="Paid to">
          <input value={form.vendor} onChange={set('vendor')} onBlur={suggest} placeholder="Like Staples or Google Ads" autoComplete="off" className={field} />
        </Label>

        <Label
          text="Category"
          hint={
            categoryFrom === 'learned'
              ? 'Picked for you, the same as last time for this vendor.'
              : categoryFrom === 'guess'
                ? 'Suggested from the name. Change it if it’s wrong and the app will remember.'
                : null
          }
        >
          <select
            value={form.category}
            onChange={(e) => {
              setForm((f) => ({ ...f, category: e.target.value }))
              setCategoryFrom('picked')
            }}
            className={field}
          >
            <option value="" disabled>
              Choose a category
            </option>
            {lists.categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <Label text="Date paid">
            <input type="date" value={form.date} max={todayIso()} onChange={set('date')} className={field} />
          </Label>
          <Label text="Paid with">
            <select value={form.paidWith} onChange={set('paidWith')} className={field}>
              {lists.paidWith.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Label>
        </div>

        <Label text="GST/HST on the receipt (optional)" hint="Copy the GST or HST line from the receipt. You can claim it back once you register for GST.">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
            <input inputMode="decimal" placeholder="0.00" value={form.gst} onChange={set('gst')} className={`${field} pl-8`} />
          </div>
        </Label>

        <Label text="Note (optional)">
          <input value={form.note} onChange={set('note')} placeholder="What it was for" className={field} />
        </Label>
      </fieldset>

      {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}

      {!readOnly && (
        <div className="mt-6 flex flex-col gap-3">
          <button type="submit" disabled={saving || photo.busy} className="h-12 rounded-full fin-grad text-white font-bold disabled:opacity-60">
            {saving ? 'Saving...' : isNew ? 'Save expense' : 'Save changes'}
          </button>
          {!isNew && lists.canDelete && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="h-11 text-sm text-fin-muted hover:text-fin-bad">
              Delete this expense
            </button>
          )}
          {confirmDelete && (
            <div className="rounded-2xl border border-fin-bad/50 p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">Delete this expense and its receipt?</span>
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

function Label({ text, hint, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {text}
      {children}
      {hint && <span className="text-xs font-normal text-fin-muted">{hint}</span>}
    </label>
  )
}
