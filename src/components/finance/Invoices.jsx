import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  centsToText,
  deleteInvoice,
  fetchInvoices,
  markInvoicePaid,
  money,
  monthTitle,
  saveInvoice,
  sendInvoice,
  shortDate,
  toCents,
  voidInvoice,
} from '../../lib/finance'
import { invoiceChoices, invoiceLines } from '../../lib/packages'
import { invoiceCalendar, nextUnbilled } from '../../lib/invoiceCalendar'

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(new Date())
const total = (inv) => inv.subtotal + (inv.gst || 0)
const byNewest = (a, b) => (b.issued ?? '').localeCompare(a.issued ?? '') || b.createdAt.localeCompare(a.createdAt)

// What to call an invoice's state, with "late" worked out from the due date.
function stateOf(inv) {
  if (inv.status === 'open' && inv.due < todayIso()) return { label: 'Late', tone: 'bad' }
  return (
    {
      draft: { label: 'Draft', tone: 'muted' },
      open: { label: 'Sent', tone: 'warn' },
      paid: { label: 'Paid', tone: 'good' },
      void: { label: 'Void', tone: 'muted' },
    }[inv.status] ?? { label: inv.status, tone: 'muted' }
  )
}

const TONES = {
  bad: 'text-fin-bad border-fin-bad/50',
  warn: 'text-fin-warn border-fin-warn/50',
  good: 'text-fin-good border-fin-good/50',
  muted: 'text-fin-muted border-fin-line',
}

function Chip({ inv }) {
  const s = stateOf(inv)
  return <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${TONES[s.tone]}`}>{s.label}</span>
}

// /finance/invoices: the list, the form for a new invoice or a draft, and a
// sent invoice with its Pay now link. ?add=1 opens a new one, ?open=<id> one.
// ?add=1&file=<file no>&bill=month&month=YYYY-MM opens one filled in from the
// invoice calendar.
export default function Invoices({ onChanged }) {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState({ status: 'loading' })
  const openId = params.get('add') ? 'new' : params.get('open')

  useEffect(() => {
    fetchInvoices()
      .then((d) => setData({ status: 'ready', ...d }))
      .catch(() => setData({ status: 'error' }))
  }, [])

  const close = () => setParams({}, { replace: true })
  const keep = (saved) => {
    setData((d) => ({ ...d, invoices: [saved, ...d.invoices.filter((i) => i.id !== saved.id)].sort(byNewest) }))
    onChanged()
  }

  if (data.status === 'loading') return <p className="text-fin-muted">Loading invoices...</p>
  if (data.status === 'error') return <p className="text-fin-muted">Couldn't load your invoices. Please refresh the page.</p>

  if (openId) {
    const invoice = openId === 'new' ? null : data.invoices.find((i) => i.id === openId)
    if (openId !== 'new' && !invoice) return <BackOnly onBack={close} />
    const props = {
      key: openId,
      invoice,
      lists: data,
      start: openId === 'new' && params.get('file') ? { fileNo: params.get('file'), bill: params.get('bill'), month: params.get('month') } : null,
      onBack: close,
      onKeep: keep,
      onSaved: (saved) => {
        keep(saved)
        setParams({ open: saved.id }, { replace: true })
      },
    }
    if (!invoice || invoice.status === 'draft') {
      return (
        <InvoiceForm
          {...props}
          onDeleted={(id) => {
            setData((d) => ({ ...d, invoices: d.invoices.filter((i) => i.id !== id) }))
            onChanged()
            close()
          }}
        />
      )
    }
    return <InvoiceView {...props} />
  }

  return (
    <InvoiceList
      data={data}
      onAdd={() => setParams({ add: '1' })}
      onOpen={(id) => setParams({ open: id })}
      onMake={(row) => setParams({ add: '1', file: row.client.fileNo, bill: 'month', month: row.due.month })}
    />
  )
}

function BackOnly({ onBack }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-fin-muted hover:text-text">
        ‹ Back to invoices
      </button>
      <p className="pt-4 text-fin-muted">That invoice was removed.</p>
    </div>
  )
}

const FILTERS = [
  ['all', 'All'],
  ['unpaid', 'Unpaid'],
  ['draft', 'Drafts'],
  ['paid', 'Paid'],
]

function InvoiceList({ data, onAdd, onOpen, onMake }) {
  const [filter, setFilter] = useState('all')
  const now = todayIso()
  const open = data.invoices.filter((i) => i.status === 'open')
  const late = open.filter((i) => i.due < now)
  const paidThisMonth = data.invoices.filter((i) => i.status === 'paid' && i.paidOn?.startsWith(now.slice(0, 7)))
  const rows = data.invoices.filter((i) =>
    filter === 'all' ? true : filter === 'unpaid' ? i.status === 'open' : i.status === filter,
  )

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Billing</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">Invoices</h1>
        </div>
        <button type="button" onClick={onAdd} className="h-11 px-5 rounded-full fin-grad text-white font-semibold">
          New invoice
        </button>
      </div>

      {!data.stripe && (
        <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel-2/60 px-5 py-4 text-sm text-fin-muted">
          <b className="text-text">Stripe isn’t connected yet.</b> You can make invoices now and send them yourself. Once Stripe is
          connected, it can email them with a Pay now button.
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <Tile label="Unpaid" value={money(open.reduce((t, i) => t + total(i), 0))} />
        <Tile label="Late" value={late.length} bad={late.length > 0} />
        <Tile label={`Paid in ${monthTitle(now.slice(0, 7)).split(' ')[0]}`} value={money(paidThisMonth.reduce((t, i) => t + total(i), 0))} />
      </div>

      <InvoiceCalendar data={data} today={now} onMake={onMake} onOpen={onOpen} />

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {FILTERS.map(([key, name]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`h-9 px-4 rounded-full border text-sm shrink-0 ${filter === key ? 'bg-fin-panel border-fin-line text-text font-semibold' : 'border-transparent text-fin-muted'}`}
          >
            {name}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-fin-line bg-fin-panel p-6 text-fin-muted">
          {data.invoices.length ? 'No invoices here.' : (
            <>
              No invoices yet. Tap <b className="text-text">New invoice</b> to bill a client.
            </>
          )}
        </div>
      ) : (
        <ul className="mt-4 rounded-2xl border border-fin-line bg-fin-panel divide-y divide-fin-line overflow-hidden">
          {rows.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => onOpen(i.id)} className="w-full text-left px-4 md:px-5 py-3.5 flex items-center gap-3 hover:bg-fin-panel-2">
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold truncate">{i.client}</span>
                    <Chip inv={i} />
                  </span>
                  <span className="block text-sm text-fin-muted truncate">
                    {i.number ?? 'Not sent yet'}
                    {i.status === 'open' && ` · due ${shortDate(i.due)}`}
                    {i.status === 'paid' && i.paidOn && ` · paid ${shortDate(i.paidOn)}`}
                  </span>
                </span>
                <span className="tabular-nums font-semibold">{money(total(i))}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const DUE_TEXT = {
  made: ['Sent', 'border-fin-good/50 text-fin-good'],
  draft: ['Draft, not sent', 'border-fin-warn/50 text-fin-warn'],
  late: ['Late', 'border-fin-bad/50 text-fin-bad'],
  today: ['Today', 'border-fin-warn/50 text-fin-warn'],
  week: ['This week', 'border-fin-warn/50 text-fin-warn'],
  later: ['Coming up', 'border-fin-line text-fin-muted'],
}

// Monthly invoices from each signed client's schedule: who to bill and when,
// so nobody is missed. Made ones stay listed for the month for peace of mind.
function InvoiceCalendar({ data, today, onMake, onOpen }) {
  const monthAgo = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10)
  const rows = invoiceCalendar(data.clients, data.invoices, today).filter((r) => r.state !== 'made' || r.due.date >= monthAgo)
  const waiting = rows.filter((r) => ['late', 'today', 'week'].includes(r.state)).length
  return (
    <section className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-4 md:p-5" aria-labelledby="calendar-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="calendar-heading" className="font-display font-bold text-xl">
          Invoice calendar
        </h2>
        <span className={`text-sm ${waiting ? 'text-fin-warn font-semibold' : 'text-fin-muted'}`}>
          {waiting ? `${waiting} to send now` : 'Nothing to send this week'}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="pt-2 text-sm text-fin-muted">
          Monthly invoices show up here once a client signs their service agreement (and pays any deposit).
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((r) => {
            const [label, tone] = DUE_TEXT[r.invoice?.status === 'draft' ? 'draft' : r.state]
            return (
              <li key={`${r.client.id}-${r.due.month}`} className="rounded-xl border border-fin-line bg-fin-panel-2/60 px-3 py-3 flex flex-wrap items-center gap-3">
                <span className="w-14 shrink-0 text-center">
                  <span className="block text-xs uppercase text-fin-muted">{shortDate(r.due.date).split(' ')[0]}</span>
                  <span className="block font-display font-bold text-xl leading-tight">{Number(r.due.date.slice(8))}</span>
                </span>
                <span className="flex-1 min-w-[10rem]">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{r.client.name}</span>
                    <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${tone}`}>{label}</span>
                  </span>
                  <span className="block text-sm text-fin-muted">
                    Month {r.due.n} · {r.client.fileNo}
                  </span>
                </span>
                {r.invoice ? (
                  <button type="button" onClick={() => onOpen(r.invoice.id)} className="h-10 px-4 rounded-full border border-fin-line text-sm font-semibold">
                    View
                  </button>
                ) : (
                  <button type="button" onClick={() => onMake(r)} className="h-10 px-4 rounded-full fin-grad text-white text-sm font-semibold">
                    Make invoice
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Tile({ label, value, bad = false }) {
  return (
    <div className={`rounded-2xl border bg-fin-panel p-3 sm:p-4 ${bad ? 'border-fin-bad/50' : 'border-fin-line'}`}>
      <div className="text-xs sm:text-sm text-fin-muted">{label}</div>
      <div className={`font-display font-bold text-lg sm:text-2xl mt-1 break-words ${bad ? 'text-fin-bad' : ''}`}>{value}</div>
    </div>
  )
}

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'
const OTHER = '__other'
const cleanFileNo = (value) => String(value ?? '').toUpperCase().replace(/\s+/g, '')
const emptyLine = () => ({ description: '', service: '', amount: '' })
// Like toCents, with a minus sign allowed for a saving or discount.
const lineCents = (text) => {
  const t = String(text ?? '').trim()
  const cents = toCents(t.startsWith('-') ? t.slice(1) : t)
  return cents === null ? null : t.startsWith('-') ? -cents : cents
}

function InvoiceForm({ invoice, lists, start, onBack, onKeep, onSaved, onDeleted }) {
  const isNew = !invoice
  // Set once the draft is saved, so sending again after a problem doesn't make a second one.
  const [savedId, setSavedId] = useState(invoice?.id)
  const firstClient = lists.clients[0]
  const [form, setForm] = useState(() => ({
    clientId: invoice ? (invoice.clientId ?? OTHER) : (firstClient?.id ?? OTHER),
    client: invoice?.clientId ? '' : (invoice?.client ?? ''),
    email: invoice?.email ?? firstClient?.email ?? '',
    dueDays: invoice?.dueDays ?? 14,
    note: invoice?.note ?? '',
    fileNo: invoice?.fileNo ?? '',
    forMonth: invoice?.forMonth ?? '',
  }))
  const [lines, setLines] = useState(() =>
    invoice ? invoice.lines.map((l) => ({ ...l, amount: centsToText(l.amount) })) : [emptyLine()],
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setLine = (i, key) => (e) => setLines((ls) => ls.map((l, n) => (n === i ? { ...l, [key]: e.target.value } : l)))

  function pickClient(e) {
    const id = e.target.value
    const client = lists.clients.find((c) => c.id === id)
    setForm((f) => ({ ...f, clientId: id, email: client ? client.email : f.email }))
  }

  // Typing a signed client's file number picks them and fills in the lines.
  const [fileInput, setFileInput] = useState(invoice?.fileNo ?? start?.fileNo ?? '')
  const [what, setWhat] = useState('')
  const fileClient = lists.clients.find((c) => c.fileNo && c.fileNo === cleanFileNo(fileInput))
  const choices = fileClient?.package ? invoiceChoices(fileClient.package) : []

  function fillFromFile(choice) {
    if (!fileClient) return setError('No signed agreement has that file number. Check it on the client’s agreement in Admin.')
    setError('')
    const pick = choice || what || choices[0]?.value
    setWhat(pick ?? '')
    // A monthly bill counts for the client's next month on the invoice calendar.
    const forMonth = ['month', 'all'].includes(pick) ? (choice === start?.bill && start?.month) || nextUnbilled(fileClient, lists.invoices) : ''
    setForm((f) => ({ ...f, clientId: fileClient.id, email: fileClient.email || f.email, fileNo: fileClient.fileNo, forMonth }))
    const filled = pick ? invoiceLines(fileClient.package, pick, fileClient.fileNo) : []
    setLines(filled.length ? filled.map((l) => ({ ...l, amount: centsToText(l.amount) })) : [emptyLine()])
  }

  // Opened from the invoice calendar: fill it in straight away.
  useEffect(() => {
    if (start?.fileNo && fileClient) fillFromFile(start.bill)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cents = lines.map((l) => lineCents(l.amount) ?? 0)
  const subtotal = cents.reduce((t, c) => t + c, 0)
  const gst = lists.gst ? Math.round(subtotal * 0.05) : 0

  // Saves the draft, then sends it if asked: 'stripe' or 'self'.
  async function save(send) {
    setError('')
    const payload = {
      ...form,
      clientId: form.clientId === OTHER ? null : form.clientId,
      dueDays: Number(form.dueDays),
      lines: lines.map((l) => ({ description: l.description, service: l.service || 'Other', amount: lineCents(l.amount) })),
    }
    const bad = lines.findIndex((l) => l.amount.trim() && lineCents(l.amount) === null)
    if (bad >= 0) return setError('Type each amount like 349.99.')
    setBusy(send || 'save')
    try {
      let saved = await saveInvoice(savedId, payload)
      setSavedId(saved.id)
      if (send) {
        try {
          saved = await sendInvoice(saved.id, send === 'stripe')
        } catch (err) {
          // The draft is saved; stay on it with the problem so it can be fixed and sent again.
          onKeep(saved)
          setError(err.message)
          setBusy('')
          return
        }
      }
      onSaved(saved)
    } catch (err) {
      setError(err.message)
      setBusy('')
    }
  }

  async function remove() {
    setBusy('delete')
    try {
      await deleteInvoice(savedId)
      onDeleted(savedId)
    } catch (err) {
      setError(err.message)
      setBusy('')
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save(null)
      }}
      className="max-w-2xl"
    >
      <button type="button" onClick={onBack} className="text-sm text-fin-muted hover:text-text">
        ‹ Back to invoices
      </button>
      <h1 className="font-display font-bold text-3xl pt-3">{isNew ? 'New invoice' : 'Draft invoice'}</h1>

      <fieldset disabled={Boolean(busy)} className="mt-6 flex flex-col gap-5">
        <div className="rounded-2xl border border-fin-line bg-fin-panel p-4 flex flex-col gap-3">
          <Label text="File number (optional)" hint="From a signed service agreement. It fills in the client and what they signed up for.">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <input
                value={fileInput}
                onChange={(e) => setFileInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fillFromFile()
                  }
                }}
                placeholder="LCF-2026-001"
                autoComplete="off"
                className={`${field} min-w-0 uppercase`}
              />
              <button type="button" onClick={() => fillFromFile()} className="h-12 px-5 rounded-full fin-grad text-white font-bold">
                Fill in
              </button>
            </div>
          </Label>
          {fileClient && (
            <div className="text-sm">
              <span className="text-fin-good font-semibold">{fileClient.name}</span>
              {!choices.length && <span className="text-fin-muted"> · no package saved, so add the lines yourself.</span>}
            </div>
          )}
          {fileClient && choices.length > 0 && form.fileNo === fileClient.fileNo && (
            <Label text="What to bill">
              <select value={what} onChange={(e) => fillFromFile(e.target.value)} className={field}>
                {choices.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Label>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Label text="Client">
            <select value={form.clientId} onChange={pickClient} className={field}>
              {lists.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={OTHER}>Someone else</option>
            </select>
          </Label>
          {form.clientId === OTHER && (
            <Label text="Bill to">
              <input value={form.client} onChange={set('client')} placeholder="Name or business" autoComplete="off" className={field} />
            </Label>
          )}
          <Label text="Their email" hint={lists.stripe ? 'Stripe sends the invoice here.' : null}>
            <input type="email" value={form.email} onChange={set('email')} placeholder="name@business.ca" autoComplete="off" className={field} />
          </Label>
        </div>

        <div>
          <div className="text-sm font-medium">What it’s for</div>
          <div className="mt-2 flex flex-col gap-3">
            {lines.map((l, i) => (
              <div key={i} className="rounded-2xl border border-fin-line bg-fin-panel p-3 grid grid-cols-[1fr_7.5rem] gap-2">
                <input
                  value={l.description}
                  onChange={setLine(i, 'description')}
                  placeholder="Like Grow Plan for November"
                  aria-label="Description"
                  className={`${field} col-span-2`}
                />
                <select value={l.service} onChange={setLine(i, 'service')} aria-label="Service" className={field}>
                  <option value="">Service</option>
                  {lists.services.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
                  <input inputMode="text" placeholder="0.00" value={l.amount} onChange={setLine(i, 'amount')} aria-label="Amount" className={`${field} pl-7`} />
                </div>
                {lines.length > 1 && (
                  <button type="button" onClick={() => setLines((ls) => ls.filter((_, n) => n !== i))} className="col-span-2 text-left text-xs text-fin-muted hover:text-fin-bad">
                    Remove this line
                  </button>
                )}
              </div>
            ))}
          </div>
          {lines.length < 10 && (
            <button type="button" onClick={() => setLines((ls) => [...ls, emptyLine()])} className="mt-3 text-sm font-semibold text-fin-muted hover:text-text">
              + Add a line
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Label text="Due">
            <select value={form.dueDays} onChange={set('dueDays')} className={field}>
              {lists.dueDays.map((d) => (
                <option key={d} value={d}>
                  {d} days after it’s sent
                </option>
              ))}
            </select>
          </Label>
          <Label text="Note to the client (optional)">
            <input value={form.note} onChange={set('note')} placeholder="Thanks for your business!" className={field} />
          </Label>
        </div>

        <Totals subtotal={subtotal} gst={gst} showGst={lists.gst} />
      </fieldset>

      {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}

      <div className="mt-6 flex flex-col gap-3">
        {lists.canEdit && lists.stripe && (
          <button type="button" onClick={() => save('stripe')} disabled={Boolean(busy)} className="h-12 rounded-full fin-grad text-white font-bold disabled:opacity-60">
            {busy === 'stripe' ? 'Sending...' : 'Send with Stripe'}
          </button>
        )}
        <button type="submit" disabled={Boolean(busy)} className="h-12 rounded-full border border-fin-line font-semibold hover:bg-fin-panel disabled:opacity-60">
          {busy === 'save' ? 'Saving...' : 'Save draft'}
        </button>
        {lists.canEdit && (
          <button type="button" onClick={() => save('self')} disabled={Boolean(busy)} className="h-11 text-sm text-fin-muted hover:text-text">
            {busy === 'self' ? 'Saving...' : 'Mark as sent (I’ll send it myself)'}
          </button>
        )}
        {lists.canEdit && lists.stripe && (
          <div className="text-xs text-fin-muted text-center">Stripe emails your client the invoice with a Pay now button. It’s marked paid here when they pay.</div>
        )}
        {savedId && lists.canDelete && !confirmDelete && (
          <button type="button" onClick={() => setConfirmDelete(true)} className="h-11 text-sm text-fin-muted hover:text-fin-bad">
            Delete this draft
          </button>
        )}
        {confirmDelete && (
          <div className="rounded-2xl border border-fin-bad/50 p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm">Delete this draft?</span>
            <span className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 px-4 rounded-full border border-fin-line text-sm">
                Keep it
              </button>
              <button type="button" onClick={remove} disabled={Boolean(busy)} className="h-10 px-4 rounded-full bg-fin-bad text-white text-sm font-semibold">
                Delete
              </button>
            </span>
          </div>
        )}
      </div>
    </form>
  )
}

function Totals({ subtotal, gst, showGst }) {
  return (
    <div className="rounded-2xl border border-fin-line bg-fin-panel p-5 flex flex-col gap-2 text-sm">
      <Row label="Subtotal" value={money(subtotal)} />
      {showGst ? <Row label="GST (5%)" value={money(gst)} /> : <Row label="GST" value="Not charged (not registered yet)" muted />}
      <div className="border-t border-fin-line pt-2 mt-1">
        <Row label="Total" value={money(subtotal + gst)} strong />
      </div>
    </div>
  )
}

function Row({ label, value, strong = false, muted = false }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-fin-muted">{label}</span>
      <span className={`tabular-nums text-right ${strong ? 'font-display font-bold text-xl' : ''} ${muted ? 'text-fin-faint' : ''}`}>{value}</span>
    </div>
  )
}

function InvoiceView({ invoice, lists, onBack, onSaved }) {
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState({ date: todayIso(), receivedBy: lists.receivedBy[0] })
  const [confirmVoid, setConfirmVoid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function run(action) {
    setError('')
    setBusy(true)
    try {
      onSaved(await action())
      setPaying(false)
      setConfirmVoid(false)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  async function copy() {
    await navigator.clipboard?.writeText(invoice.payUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canAct = lists.canEdit && invoice.status === 'open'

  return (
    <div className="max-w-2xl">
      <button type="button" onClick={onBack} className="text-sm text-fin-muted hover:text-text">
        ‹ Back to invoices
      </button>
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <h1 className="font-display font-bold text-3xl">{invoice.number}</h1>
        <Chip inv={invoice} />
      </div>

      <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-5 grid grid-cols-2 gap-4 text-sm">
        <Fact label="Bill to" value={invoice.client} />
        {invoice.fileNo && <Fact label="File no." value={invoice.fileNo} />}
        <Fact label="Email" value={invoice.email || '—'} />
        <Fact label="Sent" value={`${shortDate(invoice.sentOn ?? invoice.issued)}${invoice.sentBy === 'stripe' ? ' by Stripe' : ''}`} />
        <Fact label={invoice.status === 'paid' ? 'Paid' : 'Due'} value={shortDate(invoice.status === 'paid' ? invoice.paidOn : invoice.due)} />
      </div>

      <ul className="mt-4 rounded-2xl border border-fin-line bg-fin-panel divide-y divide-fin-line">
        {invoice.lines.map((l, i) => (
          <li key={i} className="px-5 py-3 flex justify-between gap-3 text-sm">
            <span>
              <span className="block font-semibold">{l.description}</span>
              <span className="text-fin-muted">{l.service}</span>
            </span>
            <span className="tabular-nums">{money(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Totals subtotal={invoice.subtotal} gst={invoice.gst} showGst={invoice.gst > 0} />
      </div>
      {invoice.note && <div className="mt-4 text-sm text-fin-muted">Note: {invoice.note}</div>}

      {invoice.payUrl && invoice.status === 'open' && (
        <div className="mt-4 rounded-2xl border border-fin-line bg-fin-panel p-5 text-sm">
          <div className="font-semibold">Pay now link</div>
          <div className="text-fin-muted mt-1">Stripe emailed this to your client. You can also text or send it yourself.</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="h-10 px-4 rounded-full border border-fin-line font-semibold hover:bg-fin-panel-2">
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <a href={invoice.payUrl} target="_blank" rel="noreferrer" className="h-10 px-4 rounded-full border border-fin-line font-semibold grid place-items-center hover:bg-fin-panel-2">
              Open it
            </a>
          </div>
        </div>
      )}
      {invoice.pdfUrl && (
        <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm underline text-fin-muted hover:text-text">
          Download the PDF
        </a>
      )}

      {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}

      {canAct && !paying && !confirmVoid && (
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={() => setPaying(true)} className="h-12 rounded-full fin-grad text-white font-bold">
            They paid another way
          </button>
          <button type="button" onClick={() => setConfirmVoid(true)} className="h-11 text-sm text-fin-muted hover:text-fin-bad">
            Void this invoice
          </button>
        </div>
      )}

      {paying && (
        <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel p-5 flex flex-col gap-4">
          <div className="text-sm text-fin-muted">For an e-Transfer, cash or cheque. Card payments through the Pay now link are marked paid on their own.</div>
          <div className="grid grid-cols-2 gap-4">
            <Label text="Date received">
              <input type="date" value={paid.date} max={todayIso()} onChange={(e) => setPaid((p) => ({ ...p, date: e.target.value }))} className={field} />
            </Label>
            <Label text="Paid by">
              <select value={paid.receivedBy} onChange={(e) => setPaid((p) => ({ ...p, receivedBy: e.target.value }))} className={field}>
                {lists.receivedBy.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPaying(false)} className="h-11 px-5 rounded-full border border-fin-line text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => markInvoicePaid(invoice.id, paid.date, paid.receivedBy))}
              className="h-11 px-5 rounded-full fin-grad text-white text-sm font-semibold disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Mark paid'}
            </button>
          </div>
        </div>
      )}

      {confirmVoid && (
        <div className="mt-6 rounded-2xl border border-fin-bad/50 p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm">Void this invoice? {invoice.sentBy === 'stripe' && 'The Pay now link will stop working.'}</span>
          <span className="flex gap-2">
            <button type="button" onClick={() => setConfirmVoid(false)} className="h-10 px-4 rounded-full border border-fin-line text-sm">
              Keep it
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => voidInvoice(invoice.id))}
              className="h-10 px-4 rounded-full bg-fin-bad text-white text-sm font-semibold"
            >
              Void
            </button>
          </span>
        </div>
      )}
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-fin-muted">{label}</div>
      <div className="font-semibold mt-0.5 break-words">{value}</div>
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
