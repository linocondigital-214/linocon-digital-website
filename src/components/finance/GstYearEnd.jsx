import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { addMove, deleteMove, fetchBooks, money, shortDate, toCents } from '../../lib/finance'

const VIEWS = [
  ['gst', 'GST'],
  ['year-end', 'Year-end'],
  ['balance', 'Balance sheet'],
  ['moves', 'Owner & tax money'],
]

// /finance/gst: GST returns and the $30,000 check, the year-end close to
// 2030, balance sheets, and the owner & tax money that feeds them.
export default function GstYearEnd({ onChanged }) {
  const [params, setParams] = useSearchParams()
  const view = VIEWS.some(([k]) => k === params.get('view')) ? params.get('view') : 'gst'
  const [year, setYear] = useState(null)
  const [data, setData] = useState({ status: 'loading' })

  const load = useCallback(() => {
    fetchBooks(year)
      .then((d) => setData({ status: 'ready', ...d }))
      .catch(() => setData({ status: 'error' }))
  }, [year])
  useEffect(load, [load])

  if (data.status === 'loading') return <p className="text-fin-muted">Loading...</p>
  if (data.status === 'error') return <p className="text-fin-muted">Couldn't load your books. Please refresh the page.</p>

  return (
    <div className="max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">For CRA and your accountant</p>
      <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">GST &amp; Year-End</h1>

      <div className="mt-6 flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        {VIEWS.map(([key, name]) => (
          <button
            key={key}
            type="button"
            onClick={() => setParams(key === 'gst' ? {} : { view: key }, { replace: true })}
            className={`h-10 px-4 rounded-full border text-sm shrink-0 ${view === key ? 'bg-fin-panel border-fin-line text-text font-semibold' : 'border-transparent text-fin-muted'}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {view === 'gst' && <Gst data={data} onYear={setYear} />}
        {view === 'year-end' && <YearEnd data={data} />}
        {view === 'balance' && <Balance data={data} />}
        {view === 'moves' && (
          <Moves
            data={data}
            onChanged={() => {
              load()
              onChanged()
            }}
          />
        )}
      </div>
    </div>
  )
}

function Panel({ title, aside, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-fin-line bg-fin-panel p-5 md:p-6 ${className}`}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-bold text-lg md:text-xl">{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

const STATUS = {
  under: ['Under $30,000. Registering is optional.', 'text-fin-good'],
  close: ['Close to $30,000. Plan to register soon.', 'text-fin-warn'],
  over: ['Over $30,000. You must register for GST now.', 'text-fin-bad'],
}

function Gst({ data, onYear }) {
  const { settings, gst, check, balance } = data
  const quarterly = settings.gstFiling === 'Quarterly'
  const rows = [...gst.quarters, gst.full]
  return (
    <div className="flex flex-col gap-4">
      {settings.gstRegistered ? (
        <Panel>
          <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="text-sm text-fin-muted">{balance.today.gst < 0 ? 'CRA owes you a refund' : 'Still owing to CRA'}</div>
              <div className={`font-display font-bold text-3xl mt-1 ${balance.today.gst > 0 ? 'text-fin-warn' : balance.today.gst < 0 ? 'text-fin-good' : ''}`}>
                {money(Math.abs(balance.today.gst))}
              </div>
              <div className="text-sm text-fin-muted mt-1">
                GST charged since {shortDate(settings.gstRegisteredOn)}, less GST claimed back on expenses and GST already paid.
                {balance.today.gst > 0 && ' Keep at least this much aside. It isn’t your money.'}
              </div>
            </div>
            <div className="text-sm text-fin-muted sm:text-right">
              Registered from {shortDate(settings.gstRegisteredOn)}
              <br />
              {settings.gstFiling} filing
              {settings.gstNumber && (
                <>
                  <br />
                  {settings.gstNumber}
                </>
              )}
            </div>
          </div>
        </Panel>
      ) : (
        <Panel title="The $30,000 check" aside={<span className="text-sm text-fin-faint">Last 4 calendar quarters</span>}>
          <div className="font-display font-bold text-3xl">
            {money(check.total)} <span className="text-fin-muted text-lg font-normal">of $30,000</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-fin-panel-2 overflow-hidden">
            <div className="h-full fin-grad" style={{ width: `${Math.min(100, (check.total / check.limit) * 100)}%` }} />
          </div>
          <div className={`mt-3 font-semibold ${STATUS[check.status][1]}`}>{STATUS[check.status][0]}</div>
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {check.quarters.map((q) => (
              <li key={q.name} className="rounded-xl bg-fin-panel-2/60 px-3 py-2">
                <div className="text-fin-muted">{q.name}</div>
                <div className="font-semibold tabular-nums">{money(q.sales)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm text-fin-muted">
            You don’t have to charge GST until sales go over $30,000 in four calendar quarters in a row, or in one quarter. When you
            register, turn it on in{' '}
            <Link to="/finance/settings" className="underline hover:text-text">
              Settings
            </Link>{' '}
            and invoices start adding GST.
          </div>
        </Panel>
      )}

      <Panel
        title="GST return numbers"
        aside={
          <select value={gst.year} onChange={(e) => onYear(Number(e.target.value))} aria-label="Year" className="h-10 rounded-xl bg-fin-panel-2 border border-fin-line px-3">
            {data.years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        }
      >
        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-fin-muted">
                <th className="font-medium py-2 pr-3">Period</th>
                <Th>Sales before tax (line 101)</Th>
                <Th>GST charged (line 105)</Th>
                <Th>GST claimed back (line 108)</Th>
                <Th>Net to pay (line 109)</Th>
                <th className="font-medium py-2 pl-3 text-right">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fin-line">
              {rows.map((r) => (
                <tr key={r.name} className={r.name === 'Full year' ? 'font-semibold' : ''}>
                  <td className="py-2.5 pr-3">{r.name}</td>
                  <Td>{money(r.sales)}</Td>
                  <Td>{money(r.charged)}</Td>
                  <Td>{money(r.credits)}</Td>
                  <Td>{money(r.net)}</Td>
                  <td className="py-2.5 pl-3 text-right text-fin-muted">
                    {r.due ? (r.name === 'Full year' ? `Pay by ${shortDate(r.due)}, file by Jun 15` : shortDate(r.due)) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-fin-muted">
          {quarterly ? 'Quarterly filing: each quarter is due a month after it ends.' : 'Annual filing: one return for the year.'} Line numbers
          are from the CRA GST/HST return. Only claim the business part of an expense, and check the numbers with your accountant before
          filing.
        </div>
      </Panel>
    </div>
  )
}

const Th = ({ children }) => <th className="font-medium py-2 px-3 text-right">{children}</th>
const Td = ({ children }) => <td className="py-2.5 px-3 text-right tabular-nums">{children}</td>

function YearEnd({ data }) {
  const thisYear = Number(data.today.slice(0, 4))
  const future = data.yearEnd.filter((r) => r.year > thisYear)
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-fin-muted max-w-2xl">
        Each year’s closing cash carries forward as the next year’s opening cash, through {data.lastYear}. A year closes by itself on
        December 31. Nothing to type here.
      </div>
      {!data.settings.openingDate && (
        <div className="rounded-2xl border border-fin-warn/50 bg-fin-panel px-5 py-4 text-sm">
          Set your starting bank balance in{' '}
          <Link to="/finance/settings" className="underline">
            Settings
          </Link>{' '}
          so the cash numbers match your bank.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {data.yearEnd.filter((r) => r.year <= thisYear).map((r) => (
          <Panel
            key={r.year}
            title={String(r.year)}
            aside={
              <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${r.closed ? 'text-fin-good border-fin-good/50' : 'text-fin-warn border-fin-warn/50'}`}>
                {r.closed ? 'Closed' : 'This year so far'}
              </span>
            }
          >
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Item label="Opening cash" value={r.opening} />
              <Item label="Closing cash" value={r.closing} strong />
              <Item label="Cash in" value={r.cashIn} />
              <Item label="Cash out" value={r.cashOut} />
              <Item label="Revenue (before GST)" value={r.revenue} />
              <Item label="Expenses" value={r.expenses} />
              <Item label="Profit" value={r.profit} strong />
              <Item label="You took out" value={r.ownerOut} />
              <Item label="Unpaid invoices at Dec 31" value={r.unpaid} />
              <Item label="GST owing at Dec 31" value={r.gstOwing} />
            </dl>
          </Panel>
        ))}
      </div>
      {future.length > 0 && (
        <div className="rounded-2xl border border-fin-line px-5 py-4 text-sm text-fin-muted">
          {future[0].year}
          {future.length > 1 && ` to ${future.at(-1).year}`}: not started yet. Each will open with the cash carried forward from the year
          before.
        </div>
      )}
      <Panel title="Year-end checklist (early January)">
        <ol className="list-decimal pl-5 flex flex-col gap-2 text-sm text-fin-muted">
          <li>Make sure every expense from last year is in, with its receipt.</li>
          <li>Compare last year’s closing cash with your bank balance on December 31. If they differ, look for something missing.</li>
          <li>Follow up on any invoices still unpaid at December 31.</li>
          <li>Send the year’s export to your accountant.</li>
          <li>Sole proprietors: income tax and the T2125 are due June 15, and any balance owing must be paid by April 30. Confirm with your accountant.</li>
        </ol>
      </Panel>
    </div>
  )
}

function Item({ label, value, strong = false }) {
  return (
    <div className="flex flex-col">
      <dt className="text-fin-muted">{label}</dt>
      <dd className={`tabular-nums ${strong ? 'font-display font-bold text-lg' : 'font-semibold'} ${value < 0 ? 'text-fin-bad' : ''}`}>{money(value)}</dd>
    </div>
  )
}

const BALANCE_ROWS = [
  ['WHAT THE BUSINESS OWNS'],
  ['cash', 'Cash in bank'],
  ['owedToYou', 'Money clients owe you'],
  ['equipment', 'Equipment and other assets'],
  ['assets', 'Total assets', 'total'],
  ['WHAT THE BUSINESS OWES'],
  ['gst', 'GST owing to CRA'],
  ['card', 'Credit card balance'],
  ['loans', 'Loans'],
  ['other', 'Other money owed'],
  ['liabilities', 'Total liabilities', 'total'],
  ['equity', 'What’s left for you (owner’s equity)', 'total'],
]

function Balance({ data }) {
  const columns = [{ label: `Today, ${shortDate(data.today)}`, ...data.balance.today }, ...data.balance.years.map((b) => ({ label: `Dec 31, ${b.year}`, ...b }))]
  return (
    <Panel>
      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full text-sm" style={{ minWidth: 220 + columns.length * 130 }}>
          <thead>
            <tr>
              <th />
              {columns.map((c) => (
                <th key={c.label} className="py-2 pl-3 text-right font-semibold">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BALANCE_ROWS.map(([key, label, kind]) =>
              label ? (
                <tr key={key} className={kind === 'total' ? 'font-semibold border-t border-fin-line' : ''}>
                  <td className="py-2 pr-3">{label}</td>
                  {columns.map((c) => (
                    <td key={c.label} className={`py-2 pl-3 text-right tabular-nums ${c[key] < 0 ? 'text-fin-bad' : ''}`}>
                      {money(c[key])}
                    </td>
                  ))}
                </tr>
              ) : (
                <tr key={key}>
                  <td colSpan={columns.length + 1} className="pt-4 pb-1 text-xs font-semibold tracking-[0.14em] text-fin-muted">
                    {key}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-fin-muted">
        Each year’s column appears once the year closes on December 31. Equipment and other money owed are typed in{' '}
        <Link to="/finance/settings" className="underline hover:text-text">
          Settings
        </Link>{' '}
        and show on today’s column. Check cash in bank against your real bank balance once a month.
      </div>
    </Panel>
  )
}

const field = 'w-full h-12 rounded-xl bg-fin-panel-2 border border-fin-line px-4 text-text outline-none focus:border-fin-blue'
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver' }).format(new Date())

function Moves({ data, onChanged }) {
  const [form, setForm] = useState({ date: todayIso(), type: data.moveTypes[0], amount: '', note: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function add(e) {
    e.preventDefault()
    setError('')
    const amount = toCents(form.amount)
    if (!amount) return setError('Type the amount, like 500.00.')
    setBusy(true)
    try {
      await addMove({ ...form, amount })
      setForm((f) => ({ ...f, amount: '', note: '' }))
      onChanged()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  async function remove(id) {
    setBusy(true)
    await deleteMove(id).catch((err) => setError(err.message))
    setConfirm(null)
    setBusy(false)
    onChanged()
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 items-start">
      <Panel title="Add owner & tax money">
        <div className="text-sm text-fin-muted -mt-2 mb-4">
          Money that isn’t income or an expense: your own money in or out, GST or income tax paid to CRA, loans, and paying off the
          business credit card.
        </div>
        <form onSubmit={add} className="flex flex-col gap-4">
          <fieldset disabled={busy} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              What was it
              <select value={form.type} onChange={set('type')} className={field}>
                {data.moveTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Amount
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fin-muted">$</span>
                  <input inputMode="decimal" placeholder="0.00" value={form.amount} onChange={set('amount')} className={`${field} pl-8`} />
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Date
                <input type="date" value={form.date} max={todayIso()} onChange={set('date')} className={field} />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Note (optional)
              <input value={form.note} onChange={set('note')} placeholder="Like Q3 GST payment" className={field} />
            </label>
          </fieldset>
          {error && <div className="text-sm text-fin-bad">{error}</div>}
          <button type="submit" disabled={busy} className="h-12 rounded-full fin-grad text-white font-bold disabled:opacity-60">
            {busy ? 'Saving...' : 'Add'}
          </button>
        </form>
      </Panel>

      <Panel title="History">
        {data.moves.length === 0 ? (
          <p className="text-fin-muted">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-fin-line -my-2">
            {data.moves.map((m) => (
              <li key={m.id} className="py-3 flex items-center gap-3 text-sm">
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold">{m.type}</span>
                  <span className="block text-fin-muted truncate">
                    {shortDate(m.date)}
                    {m.note && ` · ${m.note}`}
                  </span>
                </span>
                <span className="tabular-nums font-semibold">{money(m.amount)}</span>
                {data.canDelete &&
                  (confirm === m.id ? (
                    <span className="flex gap-2">
                      <button type="button" onClick={() => setConfirm(null)} className="text-fin-muted">
                        Keep
                      </button>
                      <button type="button" onClick={() => remove(m.id)} disabled={busy} className="text-fin-bad font-semibold">
                        Delete
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirm(m.id)} aria-label="Delete" className="text-fin-faint hover:text-fin-bad px-1">
                      ×
                    </button>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
