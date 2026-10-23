import EmailOptions from '../EmailOptions'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUSINESS } from '../../lib/clientDocs'
import { dateLabel, today } from '../../lib/clientProgress'
import {
  BUNDLES,
  DEPOSITS,
  DISCOUNT_KINDS,
  GROW_TERMS,
  ITEMS,
  bundleOf,
  calcPackage,
  centsText,
  money,
  packageEmail,
  packageToDocs,
  parseList,
  pkgState,
  toCents,
} from '../../lib/packages'
import { DocMark, SendSignedCopy, StatusCard } from './DocumentView'
import { AcceptedBlock } from './ESign'

const input = 'min-w-0 rounded-xl bg-ink border border-border px-4 outline-none focus:border-blue [color-scheme:dark]'
const newId = () => Math.random().toString(36).slice(2, 8)
const card = 'rounded-2xl border border-border bg-surface p-5 md:p-6'

// Saves a typed value a moment after Lino stops typing, so the total keeps up
// without saving on every key.
function useTyped(value, onSave, delay = 600) {
  const [draft, setDraft] = useState(value)
  const timer = useRef()
  const latest = useRef(onSave)
  latest.current = onSave
  useEffect(() => () => clearTimeout(timer.current), [])
  function change(next) {
    setDraft(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => latest.current(next), delay)
  }
  function flush() {
    clearTimeout(timer.current)
    if (draft !== value) latest.current(draft)
  }
  return [draft, change, flush]
}

function Typed({ value, onSave, className = '', ...props }) {
  const [draft, change, flush] = useTyped(value ?? '', onSave)
  const Tag = props.rows ? 'textarea' : 'input'
  return <Tag {...props} value={draft} onChange={(e) => change(e.target.value)} onBlur={flush} className={`${input} ${props.rows ? 'py-3' : 'h-12'} ${className}`} />
}

// /admin/<id>/package: Lino builds this client's package. Below the form is
// the branded summary that prints, saves as PDF and goes to the client.
export default function PackageBuilder({ client, onChange, adminBase }) {
  const navigate = useNavigate()
  const pkg = pkgState(client)
  const calc = calcPackage(pkg)
  const set = (path, value) => onChange([{ path: ['docs', 'package', ...path], value }])
  const bundle = bundleOf(pkg)
  const custom = parseList(pkg.custom)
  const discounts = parseList(pkg.discounts)
  const saveList = (key, list) => set([key], list.length ? JSON.stringify(list) : null)


  // A single service clears the other ticks; a bundle or mix and match keeps them.
  function choosePackage(value) {
    if (value.startsWith('single:')) {
      const key = value.slice(7)
      onChange([{ path: ['docs', 'package', 'bundle'], value: null }, ...ITEMS.map((i) => ({ path: ['docs', 'package', 'on', i.key], value: i.key === key || null }))])
    } else {
      set(['bundle'], value === 'custom' ? null : value)
    }
  }

  async function toAgreement() {
    await onChange(packageToDocs(pkg))
    navigate(`${adminBase}/agreement`)
  }

  return (
    <div>
      <div className="no-print max-w-3xl mx-auto flex flex-col gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl">Package for {client.details.name}</h1>
          <div className="text-text-secondary mt-2">
            Pick what this client gets. Every price can be changed for this client only. The summary below updates as you go.
          </div>
        </div>

        <StatusCard client={client} docKey="package" onChange={onChange} />
        <SendSignedCopy client={client} docKey="package" />

        <div className={card}>
          <label className="flex flex-col gap-2">
            <span className="font-bold">Package</span>
            <select value={packageChoice(pkg, bundle)} onChange={(e) => choosePackage(e.target.value)} className={`${input} h-12`}>
              <optgroup label="Single service">
                {ITEMS.map((i) => (
                  <option key={i.key} value={`single:${i.key}`}>
                    {i.name} only: {money(i.cents)} {i.billing === 'once' ? 'one-time' : '/ month'}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bundles">
                {BUNDLES.filter((b) => b.key !== 'custom').map((b) => (
                  <option key={b.key} value={b.key} disabled={b.soon}>
                    {b.name}: {b.tagline}
                  </option>
                ))}
              </optgroup>
              <option value="custom">Mix and match: tick services below</option>
            </select>
          </label>
          <div className="text-sm text-text-secondary mt-3">
            {bundle.key !== 'custom'
              ? `${bundle.tagline}. You can still add other services or lines below.`
              : packageChoice(pkg, bundle) !== 'custom'
                ? 'Just this one service. You can still tick more services or add your own lines below.'
                : 'Pick one service or a bundle above, or tick the services you want below.'}
          </div>
          {bundle.key === 'custom' && pkg.on?.website && pkg.on?.seo && (
            <button type="button" onClick={() => set(['bundle'], 'launch')} className="mt-3 text-sm font-semibold text-blue text-left">
              Website + SEO together qualifies for the Launch Bundle (10% off). Switch to it
            </button>
          )}
          {bundle.key === 'custom' && pkg.on?.grow && pkg.on?.backlinks && (
            <button type="button" onClick={() => set(['bundle'], 'grow')} className="mt-3 text-sm font-semibold text-blue text-left block">
              Grow + Backlinks together qualifies for the Grow Bundle ($499.99 / month). Switch to it
            </button>
          )}
        </div>

        <div className={card}>
          <div className="font-bold">Services</div>
          <div className="flex flex-col gap-3 mt-4">
            {ITEMS.map((item) => (
              <ServiceRow key={item.key} item={item} pkg={pkg} inBundle={bundle.includes.includes(item.key)} set={set} />
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="font-bold">Your own lines</div>
          <div className="text-sm text-text-secondary mt-1">Anything special for this client, like extra pages, a logo refresh or a one-off fix.</div>
          <div className="flex flex-col gap-3 mt-4">
            {custom.map((c, i) => (
              <CustomRow
                key={c.id ?? i}
                line={c}
                onSave={(next) => saveList('custom', custom.map((x, j) => (j === i ? next : x)))}
                onRemove={() => saveList('custom', custom.filter((_, j) => j !== i))}
              />
            ))}
          </div>
          {custom.length < 8 && (
            <button
              type="button"
              onClick={() => saveList('custom', [...custom, { id: newId(), name: '', desc: '', cents: 0, billing: 'once' }])}
              className="mt-4 h-10 px-4 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary"
            >
              + Add a line
            </button>
          )}
        </div>

        <div className={card}>
          <div className="font-bold">Options</div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {calc.items.some((i) => i.key === 'grow') && (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-secondary">Grow plan term</span>
                <select value={pkg.opt?.growTerm ?? ''} onChange={(e) => set(['opt', 'growTerm'], e.target.value || null)} className={`${input} h-12`}>
                  {GROW_TERMS.map((t) => (
                    <option key={t.value} value={t.value} disabled={Number(t.value || 0) < (bundle.minMonths ?? 0)}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-secondary">Deposit</span>
              <select value={pkg.opt?.deposit ?? '50'} onChange={(e) => set(['opt', 'deposit'], e.target.value)} className={`${input} h-12`}>
                {DEPOSITS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-secondary">Extra work hours ($35 / hour)</span>
              <Typed
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={pkg.opt?.hours ?? ''}
                placeholder="0"
                onSave={(v) => set(['opt', 'hours'], Number(v) > 0 ? Number(v) : null)}
              />
            </label>
            <label className="flex items-center gap-3 sm:mt-7">
              <input type="checkbox" checked={Boolean(pkg.opt?.gst)} onChange={(e) => set(['opt', 'gst'], e.target.checked || null)} className="w-5 h-5 accent-blue" />
              <span className="text-sm font-semibold">Add GST (5%)</span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-secondary">Package date</span>
              <input type="date" value={pkg.opt?.date || ''} onChange={(e) => set(['opt', 'date'], e.target.value || null)} className={`${input} h-12`} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-secondary">Valid until</span>
              <input type="date" value={pkg.opt?.validUntil || ''} onChange={(e) => set(['opt', 'validUntil'], e.target.value || null)} className={`${input} h-12`} />
            </label>
          </div>
          {!pkg.opt?.gst && <div className="text-sm text-text-secondary mt-3">Leave GST off until you are GST registered.</div>}
        </div>

        <div className={card}>
          <div className="font-bold">Discounts</div>
          <div className="text-sm text-text-secondary mt-1">For example a founding client discount, or referral credits this client has earned.</div>
          <div className="flex flex-col gap-3 mt-4">
            {discounts.map((d, i) => (
              <DiscountRow
                key={d.id ?? i}
                discount={d}
                onSave={(next) => saveList('discounts', discounts.map((x, j) => (j === i ? next : x)))}
                onRemove={() => saveList('discounts', discounts.filter((_, j) => j !== i))}
              />
            ))}
          </div>
          {discounts.length < 4 && (
            <button
              type="button"
              onClick={() => saveList('discounts', [...discounts, { id: newId(), kind: 'pct-once', value: '', label: 'Founding client discount' }])}
              className="mt-4 h-10 px-4 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary"
            >
              + Add a discount
            </button>
          )}
        </div>

        <div className={card}>
          <label className="flex flex-col gap-2">
            <span className="font-bold">Note to the client</span>
            <Typed rows={3} value={pkg.opt?.note ?? ''} placeholder="Optional. Shows on the summary and in the email." maxLength={1500} onSave={(v) => set(['opt', 'note'], v.trim() || null)} />
          </label>
        </div>

        <Totals calc={calc} />

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => window.print()} className="h-11 px-5 rounded-full bg-gradient-brand text-ink text-sm font-bold">
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={toAgreement}
            disabled={calc.empty}
            className="h-11 px-5 rounded-full border border-blue text-sm font-bold text-text hover:bg-blue/10 disabled:opacity-40"
          >
            Next: service agreement &rarr;
          </button>
        </div>
        <EmailOptions
          to={client.details.email}
          subject={`Your LinoCon Digital package: ${client.details.name}`}
          body={packageEmail(client, pkg)}
          label="Email to client"
          primary="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary"
          secondary="h-11 px-5 rounded-full border border-border text-sm font-semibold flex items-center hover:border-text-tertiary"
        />
        <div className="text-sm text-text-secondary">
          In the print window, choose "Save as PDF" to download it. "Email to client" opens Gmail with the package written in; attach the
          PDF before you send. "Next" fills the proposal and service agreement with this package.
        </div>
      </div>

      <PackageSummary client={client} />
    </div>
  )
}

// What the Package menu shows: one service on its own, a bundle, or mix and match.
function packageChoice(pkg, bundle) {
  if (bundle.key !== 'custom') return bundle.key
  const on = ITEMS.filter((i) => pkg.on?.[i.key])
  return on.length === 1 ? `single:${on[0].key}` : 'custom'
}

function ServiceRow({ item, pkg, inBundle, set }) {
  const on = inBundle || Boolean(pkg.on?.[item.key])
  const own = Number.isFinite(pkg.price?.[item.key])
  return (
    <div className={`rounded-xl border p-4 ${on ? 'border-blue/60 bg-blue/5' : 'border-border'}`}>
      <div className="flex flex-wrap items-start gap-3">
        <label className="flex items-start gap-3 flex-1 min-w-[12rem] cursor-pointer">
          <input
            type="checkbox"
            checked={on}
            disabled={inBundle}
            onChange={(e) => set(['on', item.key], e.target.checked || null)}
            className="w-5 h-5 mt-0.5 accent-blue"
          />
          <span>
            <span className="font-bold block">{item.name}</span>
            <span className="text-sm text-text-secondary">
              {inBundle ? 'Included in the bundle · ' : ''}
              {money(item.cents)} {item.billing === 'once' ? 'one-time' : '/ month'}
            </span>
          </span>
        </label>
        {on && (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Price for this client $
            <Typed
              inputMode="decimal"
              value={own ? centsText(pkg.price[item.key]) : ''}
              placeholder={centsText(item.cents)}
              onSave={(v) => set(['price', item.key], v.trim() === '' ? null : toCents(v))}
              className="w-32"
            />
          </label>
        )}
      </div>
      <div className="text-sm text-text-secondary mt-2 sm:pl-8">{item.scope}</div>
      {item.note && on && <div className="text-sm text-orange mt-2 sm:pl-8">{item.note}</div>}
    </div>
  )
}

function CustomRow({ line, onSave, onRemove }) {
  const update = (patch) => onSave({ ...line, ...patch })
  return (
    <div className="rounded-xl border border-border p-4 grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_9rem_9rem] gap-3">
      <Typed value={line.name} placeholder="What it is" maxLength={80} onSave={(v) => update({ name: v.trim() })} />
      <Typed inputMode="decimal" value={line.cents ? centsText(line.cents) : ''} placeholder="Price $" onSave={(v) => update({ cents: toCents(v) ?? 0 })} />
      <select value={line.billing} onChange={(e) => update({ billing: e.target.value })} className={`${input} h-12`}>
        <option value="once">One-time</option>
        <option value="month">Per month</option>
      </select>
      <Typed value={line.desc} placeholder="Short description (optional)" maxLength={200} onSave={(v) => update({ desc: v.trim() })} className="sm:col-span-2" />
      <button type="button" onClick={onRemove} className="h-12 text-sm font-semibold text-text-tertiary hover:text-orange">
        Remove
      </button>
    </div>
  )
}

function DiscountRow({ discount, onSave, onRemove }) {
  const kind = DISCOUNT_KINDS.find((k) => k.value === discount.kind) ?? DISCOUNT_KINDS[0]
  const update = (patch) => onSave({ ...discount, ...patch })
  const isReferral = kind.value.startsWith('ref-')
  return (
    <div className="rounded-xl border border-border p-4 grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 gap-3">
      <select value={kind.value} onChange={(e) => update({ kind: e.target.value })} className={`${input} h-12 sm:col-span-2`}>
        {DISCOUNT_KINDS.map((k) => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>
      <label className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {isReferral ? 'Businesses referred' : kind.unit === '%' ? 'Percent off' : 'Dollars off'}
        <Typed inputMode="decimal" value={discount.value ?? ''} placeholder={isReferral ? '1' : '0'} onSave={(v) => update({ value: v.trim() })} className="w-24" />
        {kind.unit === '%' && '%'}
      </label>
      {kind.monthly && !isReferral && (
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          For
          <Typed inputMode="numeric" value={discount.months ?? ''} placeholder="every" onSave={(v) => update({ months: v.trim() })} className="w-24" />
          months
        </label>
      )}
      <Typed value={discount.label ?? ''} placeholder="Name shown to the client" maxLength={80} onSave={(v) => update({ label: v.trim() })} className={kind.monthly && !isReferral ? '' : 'sm:col-span-1'} />
      <button type="button" onClick={onRemove} className="h-12 text-sm font-semibold text-text-tertiary hover:text-orange justify-self-start">
        Remove
      </button>
    </div>
  )
}

function Totals({ calc }) {
  const gst = calc.gst ? ' + GST' : ''
  return (
    <div className="rounded-2xl border border-blue/50 bg-gradient-to-br from-surface-2 to-blue/10 p-5 md:p-6 grid sm:grid-cols-3 gap-4" aria-live="polite">
      <Total label="One-time" value={money(calc.onceTotal + calc.onceGst)} sub={calc.gst ? `${money(calc.onceTotal)} + ${money(calc.onceGst)} GST` : 'No GST added'} />
      <Total label="Each month" value={calc.hasMonthly ? money(calc.monthTotal + calc.monthGst) : '$0.00'} sub={calc.hasMonthly ? (calc.gst ? `${money(calc.monthTotal)} + ${money(calc.monthGst)} GST` : `${calc.growTerm ? `${calc.growTerm} months minimum` : 'Month to month'}`) : 'No monthly services'} />
      <Total label="To start" value={money(calc.deposit + calc.depositGst)} sub={calc.depositPct === '0' ? 'No deposit' : `${calc.depositPct}% deposit${gst}`} />
    </div>
  )
}

function Total({ label, value, sub }) {
  return (
    <div>
      <div className="text-sm font-semibold text-text-secondary">{label}</div>
      <div className="font-display font-bold text-3xl mt-1">{value}</div>
      <div className="text-xs text-text-secondary mt-1">{sub}</div>
    </div>
  )
}

// The branded package summary on white paper: what prints, saves as PDF and
// what the client sees on their page once it's sent.
export function PackageSummary({ client }) {
  const pkg = pkgState(client)
  const calc = calcPackage(pkg)
  const date = pkg.opt?.date || today()
  const custom = calc.custom

  return (
    <article className="print-paper bg-paper text-ink rounded-2xl p-6 sm:p-10 md:p-14 max-w-3xl mx-auto shadow-2xl">
      <header className="flex items-start justify-between gap-6 pb-6 border-b border-ink/15">
        <div className="flex items-center gap-3">
          <DocMark />
          <span className="font-display font-bold text-lg">{BUSINESS.name}</span>
        </div>
        <div className="text-right text-sm text-ink/60">
          <div>{BUSINESS.place}</div>
          <div>{BUSINESS.email}</div>
        </div>
      </header>

      <div className="py-8">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">Your package</div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl mt-2 text-ink">{client.details.name}</h1>
        <div className="text-ink/60 mt-2">
          {dateLabel(date)}
          {pkg.opt?.validUntil && <> · Valid until {dateLabel(pkg.opt.validUntil)}</>}
        </div>
        {calc.bundle.key !== 'custom' && (
          <div className="inline-block mt-4 rounded-full bg-ink text-paper text-sm font-bold px-4 py-1.5">{calc.bundle.name}</div>
        )}
      </div>

      {calc.empty ? (
        <div className="text-ink/60">No services picked yet.</div>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display font-bold text-xl text-ink">What's included</h2>
            <ul className="mt-3 flex flex-col gap-4">
              {calc.items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <Tick />
                  <div className="text-ink/80 leading-relaxed">
                    <strong className="text-ink">{i.name}</strong>
                    <span className="text-ink/50"> · {i.billing === 'once' ? 'one-time' : 'monthly'}</span>
                    <div>{i.scope}</div>
                  </div>
                </li>
              ))}
              {custom.map((c, n) => (
                <li key={n} className="flex gap-3">
                  <Tick />
                  <div className="text-ink/80 leading-relaxed">
                    <strong className="text-ink">{c.name || 'Extra'}</strong>
                    <span className="text-ink/50"> · {c.billing === 'month' ? 'monthly' : 'one-time'}</span>
                    {c.desc && <div>{c.desc}</div>}
                  </div>
                </li>
              ))}
              {Number(pkg.opt?.hours) > 0 && (
                <li className="flex gap-3">
                  <Tick />
                  <div className="text-ink/80 leading-relaxed">
                    <strong className="text-ink">Extra work</strong>
                    <div>{pkg.opt.hours} pre-booked hours for changes or extra tasks you ask for.</div>
                  </div>
                </li>
              )}
            </ul>
            {calc.items.some((i) => i.key === 'grow') && (
              <div className="text-ink/70 mt-4">
                Grow plan term: {calc.growTerm ? `${calc.growTerm} months minimum, then month to month` : 'month to month'}.
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink">Price</h2>
            {calc.once.length > 0 && (
              <PriceTable title="One-time" lines={calc.once} total={calc.onceTotal} gst={calc.gst && calc.onceGst} />
            )}
            {calc.month.length > 0 && (
              <PriceTable title="Each month" lines={calc.month} total={calc.monthTotal} gst={calc.gst && calc.monthGst} monthly />
            )}
            <div className="print-keep mt-5 rounded-xl bg-ink/5 p-4 text-ink/80">
              {calc.onceTotal > 0 && calc.depositPct !== '0' ? (
                <>
                  <strong className="text-ink">To start: {money(calc.deposit + calc.depositGst)}</strong> deposit
                  {calc.depositPct === '100' ? ' (all one-time fees)' : ` (${calc.depositPct}% of one-time fees)`} before work begins
                  {calc.depositPct === '50' ? ', and the rest at launch' : ''}.
                </>
              ) : (
                <strong className="text-ink">No deposit. One-time fees are due at launch.</strong>
              )}
              {calc.hasMonthly && ' Monthly services are billed each month, starting after launch.'}
            </div>
            <div className="text-sm text-ink/60 mt-3">
              All prices are in Canadian dollars (CAD){calc.gst ? ' and include GST as shown' : ''}. Third-party costs like your domain or hosting
              are paid directly to the provider.
            </div>
          </section>

          {pkg.opt?.note && (
            <section>
              <h2 className="font-display font-bold text-xl text-ink">A note for you</h2>
              {pkg.opt.note.split('\n').map((line, i) => (
                <div key={i} className="text-ink/80 leading-relaxed pt-2">
                  {line}
                </div>
              ))}
            </section>
          )}

          <section>
            <h2 className="font-display font-bold text-xl text-ink">Next step</h2>
            <div className="text-ink/80 leading-relaxed pt-2">
              Once you're happy with this package, we'll send you a service agreement to sign. Work begins once it's signed
              {calc.onceTotal > 0 && calc.depositPct !== '0' ? ' and the deposit is paid' : ''}.
            </div>
          </section>
        </div>
      )}

      <AcceptedBlock esign={pkg.esign} title="package" />

      <footer className="mt-12 pt-5 border-t border-ink/15 text-xs text-ink/50 flex flex-wrap justify-between gap-2">
        <span>
          {BUSINESS.name} · {BUSINESS.website}
        </span>
        <span>Get found. Get chosen. Get growing.</span>
      </footer>
    </article>
  )
}

function PriceTable({ title, lines, total, gst, monthly = false }) {
  const per = monthly ? ' / month' : ''
  return (
    <table className="w-full text-left mt-4">
      <caption className="text-left text-sm font-semibold uppercase tracking-[0.14em] text-ink/50 pb-1">{title}</caption>
      <tbody className="divide-y divide-ink/10">
        {lines.map((l, i) => (
          <tr key={i}>
            <td className="py-2.5 pr-4">
              <span className={l.cents < 0 ? 'text-ink/80' : 'text-ink'}>{l.label}</span>
              {l.detail && <span className="block text-sm text-ink/50">{l.detail}</span>}
            </td>
            <td className={`py-2.5 text-right font-semibold whitespace-nowrap ${l.cents < 0 ? 'text-[#1f8a4c]' : 'text-ink'}`}>
              {money(l.cents)}
              {per}
            </td>
          </tr>
        ))}
        {gst ? (
          <tr>
            <td className="py-2.5 pr-4">GST (5%)</td>
            <td className="py-2.5 text-right font-semibold whitespace-nowrap">
              {money(gst)}
              {per}
            </td>
          </tr>
        ) : null}
        <tr>
          <td className="py-2.5 pr-4 font-bold text-ink">Total {monthly ? 'each month' : 'one-time'}</td>
          <td className="py-2.5 text-right font-bold text-ink whitespace-nowrap">
            {money(total + (gst || 0))}
            {per}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function Tick() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="9" cy="9" r="9" fill="#2E6BFF" fillOpacity="0.15" />
      <path d="M5.5 9.2l2.2 2.2 4.8-4.8" stroke="#2E6BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
