import { Link } from 'react-router-dom'
import { greeting, money, moneyShort, monthTitle, shortDate } from '../../lib/finance'

export default function Dashboard({ summary }) {
  const { month, unpaid, gst, counts } = summary
  const empty = counts.income + counts.expenses + counts.invoices === 0
  const change = month.revenueBefore ? (month.revenue - month.revenueBefore) / month.revenueBefore : null

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">{monthTitle(month.key)}</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">
            {greeting()}, {summary.ownerName}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/finance/expenses?add=1" className="h-11 px-5 rounded-full border border-fin-line font-semibold grid place-items-center hover:bg-fin-panel">
            Add expense
          </Link>
          <Link to="/finance/invoices?add=1" className="h-11 px-5 rounded-full fin-grad text-white font-semibold grid place-items-center">
            New invoice
          </Link>
        </div>
      </div>

      {empty && (
        <div className="mt-6 rounded-2xl border border-fin-line bg-fin-panel-2/60 px-5 py-4 text-sm text-fin-muted">
          Your books are empty for now, so everything starts at $0. Payments through Stripe show up here on their own. Add an
          expense with a photo of the receipt, or record an e-Transfer under Income.
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Stat label="Revenue this month" value={money(month.revenue)}>
          {change === null ? (
            'Before GST'
          ) : (
            <>
              <span className={change >= 0 ? 'text-fin-good' : 'text-fin-bad'}>
                {change >= 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(1)}%
              </span>{' '}
              vs last month
            </>
          )}
        </Stat>
        <Stat label="Profit this month" value={money(month.profit)}>
          After {money(month.expenses)} expenses
        </Stat>
        <Stat label="Monthly recurring (MRR)" value={summary.mrr ? money(summary.mrr.amount) : '—'}>
          {summary.mrr
            ? `${summary.mrr.count} active ${summary.mrr.count === 1 ? 'plan' : 'plans'} in Stripe`
            : 'Shows once Stripe is connected'}
        </Stat>
        <Stat label="Cash in bank" value={money(summary.cash)}>
          {summary.cashAsOf ? (
            `Since ${shortDate(summary.cashAsOf)}`
          ) : (
            <Link to="/finance/settings" className="underline hover:text-text">
              Set your starting balance
            </Link>
          )}
        </Stat>
        <Stat label="Unpaid invoices" value={money(unpaid.amount)} alert={unpaid.overdue > 0}>
          {unpaid.count} {unpaid.count === 1 ? 'invoice' : 'invoices'}
          {unpaid.overdue > 0 && ` · ${unpaid.overdue} overdue`}
        </Stat>
        {gst.registered ? (
          <Stat label={`GST owing (${gst.label})`} value={money(gst.owing)}>
            Due {shortDate(gst.due)}
          </Stat>
        ) : (
          <Stat label="GST: not registered" value={`${moneyShort(gst.salesLast4Quarters)} of $30,000`}>
            Sales in the last 4 quarters
            <Meter value={gst.salesLast4Quarters / gst.limit} />
          </Stat>
        )}
      </div>

      <div className="mt-4 grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Panel title="Revenue and expenses by month" aside={<Legend />}>
          <MonthChart months={summary.months} />
        </Panel>
        <Panel title="Needs your attention">
          {summary.attention.length ? (
            <ul className="flex flex-col gap-3">
              {summary.attention.map((a) => (
                <li key={a.title} className="rounded-xl border border-fin-line bg-fin-panel-2/50 px-4 py-3 flex gap-3">
                  <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${a.tone === 'late' ? 'bg-fin-bad' : 'bg-fin-warn'}`} />
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-fin-muted">
                      {a.detail}
                      {a.amount ? `, ${money(a.amount)}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-fin-muted">Nothing needs you right now. Late invoices and missing receipts will show up here.</p>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Breakdown title="Revenue by service" rows={summary.byService} empty="No income yet this year." />
        <Breakdown title="Expenses by category" rows={summary.byCategory} empty="No expenses yet this year." />
      </div>
    </div>
  )
}

function Stat({ label, value, children, alert = false }) {
  return (
    <div className={`rounded-2xl border bg-fin-panel p-4 md:p-5 ${alert ? 'border-fin-coral/60' : 'border-fin-line'}`}>
      <p className="text-sm text-fin-muted">{label}</p>
      <div className={`font-display font-bold text-xl sm:text-2xl md:text-3xl mt-1.5 break-words ${alert ? 'text-fin-coral' : ''}`}>{value}</div>
      <div className="text-xs md:text-sm text-fin-faint mt-1.5">{children}</div>
    </div>
  )
}

function Meter({ value }) {
  return (
    <span className="block mt-2 h-1.5 rounded-full bg-fin-panel-2 overflow-hidden">
      <span className="block h-full fin-grad" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </span>
  )
}

function Panel({ title, aside, children }) {
  return (
    <section className="rounded-2xl border border-fin-line bg-fin-panel p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-lg md:text-xl">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

function Legend() {
  return (
    <div className="flex gap-4 text-sm text-fin-muted">
      <span className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-sm bg-fin-violet" /> Revenue
      </span>
      <span className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-sm bg-fin-line" /> Expenses
      </span>
    </div>
  )
}

// Grouped bars for the last six months; this month's revenue bar gets the
// brand gradient.
function MonthChart({ months }) {
  const top = Math.max(...months.flatMap((m) => [m.revenue, m.expenses]))
  const step = niceStep(top / 3)
  const max = step * 3
  const W = 560
  const H = 220
  const left = 52
  const base = 190
  const height = 160
  const col = (W - left) / months.length
  const y = (v) => base - (v / max) * height

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Revenue and expenses for the last six months">
      <defs>
        <linearGradient id="finBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#4E6CF5" />
          <stop offset="55%" stopColor="#9A5CE0" />
          <stop offset="100%" stopColor="#F26B4B" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={left} x2={W} y1={y(step * i)} y2={y(step * i)} stroke="#272733" strokeDasharray={i ? '3 4' : undefined} />
          <text x={left - 8} y={y(step * i) + 4} textAnchor="end" fontSize="11" fill="#6E6D80">
            {moneyShort(step * i)}
          </text>
        </g>
      ))}
      {months.map((m, i) => {
        const x = left + col * i + col / 2
        const last = i === months.length - 1
        return (
          <g key={m.key}>
            <title>{`${m.label}: revenue ${money(m.revenue)}, expenses ${money(m.expenses)}`}</title>
            <Bar x={x - 26} value={m.revenue} y={y} base={base} fill={last ? 'url(#finBar)' : '#9A5CE0'} opacity={last ? 1 : 0.75} />
            <Bar x={x + 2} value={m.expenses} y={y} base={base} fill="#3a3a48" />
            <text x={x} y={base + 20} textAnchor="middle" fontSize="12" fill={last ? '#F3F1EE' : '#A3A2B3'}>
              {m.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Bar({ x, value, y, base, fill, opacity = 1 }) {
  if (!value) return null
  const top = Math.min(y(value), base - 3)
  return <rect x={x} y={top} width="24" height={base - top} rx="5" fill={fill} opacity={opacity} />
}

// A round axis step in cents: 100, 250, 500, 1000... dollars.
function niceStep(raw) {
  if (raw <= 0) return 50_000
  const pow = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw)
}

function Breakdown({ title, rows, empty }) {
  const top = rows[0]?.amount || 1
  return (
    <Panel title={title} aside={<span className="text-sm text-fin-faint">This year so far</span>}>
      {rows.length ? (
        <ul className="flex flex-col gap-3">
          {rows.slice(0, 6).map((r) => (
            <li key={r.name} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate">{r.name}</span>
              <span className="h-2 rounded-full bg-fin-panel-2 overflow-hidden">
                <span className="block h-full fin-grad rounded-full" style={{ width: `${(r.amount / top) * 100}%` }} />
              </span>
              <span className="tabular-nums">{money(r.amount)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-fin-muted">{empty}</p>
      )}
    </Panel>
  )
}
