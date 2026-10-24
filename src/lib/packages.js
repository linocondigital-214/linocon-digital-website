// The package builder (/admin/<id>/package): Lino picks a client's services,
// options and discounts, and the page works out the total. Every client's
// package is different, so every price can be changed for that client and
// Lino can add lines of their own.
//
// Saved in client.docs.package:
//   { status, sentAt, signedAt,
//     bundle: 'custom' | 'launch' | 'grow' | 'allin',
//     on:     { website | seo | backlinks | grow: true }   services picked
//     price:  { <service>: cents }                       this client's price
//     opt:    { date, validUntil, growTerm, deposit, hours, gst, note }
//     custom:    JSON list of { name, desc, cents, billing: 'once' | 'month' }
//     discounts: JSON list of { kind, value, label, months } }
// All amounts are in cents, in CAD.
import { SERVICE_SCOPE } from './clientDocs'

export const GST_RATE = 0.05
export const EXTRA_RATE = 3500 // $35 per hour

// Lino's prices (CAD, .99 pricing). Website Creation is quoted per client;
// the starting price is the Stripe deposit + final payment ($499.99 each).
export const ITEMS = [
  { key: 'website', billing: 'once', cents: 99998, note: 'Quoted per client. Starts at the $499.99 deposit + $499.99 final payment.' },
  { key: 'seo', billing: 'once', cents: 59999 },
  { key: 'backlinks', billing: 'month', cents: 24999 },
  { key: 'grow', billing: 'month', cents: 34999 },
].map((item) => ({ ...item, name: item.key === 'grow' ? 'Grow Plan' : SERVICE_SCOPE[item.key].name, scope: SERVICE_SCOPE[item.key].scope }))

export const BUNDLES = [
  { key: 'custom', name: 'Pick services one by one', includes: [] },
  {
    key: 'launch',
    name: 'Launch Bundle',
    tagline: 'Website Creation + SEO Setup, 10% off',
    includes: ['website', 'seo'],
  },
  {
    key: 'grow',
    name: 'Grow Bundle',
    tagline: 'Grow plan + Backlink Building, $499.99 / month',
    includes: ['grow', 'backlinks'],
  },
  {
    key: 'allin',
    name: 'All-in Starter',
    tagline: 'Launch Bundle + at least 3 months of the Grow Bundle',
    includes: ['website', 'seo', 'grow', 'backlinks'],
    minMonths: 3,
  },
  // Shown in the menu but can't be picked until LinoCon Books is ready.
  {
    key: 'complete',
    name: 'LinoCon Complete (coming soon)',
    tagline: 'Launch + Grow Bundle + LinoCon Books, $549.99 / month for 12 months',
    includes: [],
    soon: true,
  },
]

const LAUNCH_OFF = 0.1
const GROW_BUNDLE = 49999

export const GROW_TERMS = [
  { value: '', label: 'Month to month' },
  { value: '3', label: '3 months minimum' },
  { value: '6', label: '6 months minimum' },
  { value: '12', label: '12 months minimum' },
]

export const DEPOSITS = [
  { value: '50', label: '50% of one-time fees before work starts' },
  { value: '100', label: 'All one-time fees before work starts' },
  { value: '0', label: 'No deposit (pay at launch)' },
]

export const DISCOUNT_KINDS = [
  { value: 'pct-once', label: '% off one-time fees', unit: '%' },
  { value: 'amt-once', label: '$ off one-time fees', unit: '$' },
  { value: 'pct-month', label: '% off the monthly bill', unit: '%', monthly: true },
  { value: 'amt-month', label: '$ off the monthly bill', unit: '$', monthly: true },
  { value: 'ref-month', label: 'Referral credit: $25 off monthly for 6 months', unit: 'friends', monthly: true },
  { value: 'ref-once', label: 'Referral credit: $50 one-time', unit: 'friends' },
]

export const pkgState = (client) => client.docs?.package ?? {}

export function parseList(json) {
  try {
    const list = JSON.parse(json || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export const bundleOf = (pkg) => BUNDLES.find((b) => b.key === pkg.bundle && !b.soon) ?? BUNDLES[0]

// Services in the package: the bundle's plus any picked on their own.
export function pickedItems(pkg) {
  const bundle = bundleOf(pkg)
  return ITEMS.filter((i) => bundle.includes.includes(i.key) || pkg.on?.[i.key]).map((i) => ({
    ...i,
    cents: Number.isFinite(pkg.price?.[i.key]) ? pkg.price[i.key] : i.cents,
    inBundle: bundle.includes.includes(i.key),
  }))
}

export const growTerm = (pkg) => {
  const min = bundleOf(pkg).minMonths ?? 0
  const picked = Number(pkg.opt?.growTerm) || 0
  return Math.max(min, picked)
}

const pctOf = (cents, pct) => Math.round((cents * pct) / 100)

// Every line and total in the package. Lines are { label, detail, cents }:
// positive for charges, negative for savings and discounts.
export function calcPackage(pkg) {
  const bundle = bundleOf(pkg)
  const items = pickedItems(pkg)
  const custom = parseList(pkg.custom).filter((c) => c.name || c.cents)
  const once = []
  const month = []

  for (const i of items) (i.billing === 'once' ? once : month).push({ label: i.name, cents: i.cents })
  for (const c of custom) (c.billing === 'month' ? month : once).push({ label: c.name || 'Extra', detail: c.desc, cents: c.cents || 0 })

  const hours = Number(pkg.opt?.hours) || 0
  if (hours > 0) once.push({ label: 'Extra work', detail: `${hours} ${hours === 1 ? 'hour' : 'hours'} at $35 per hour`, cents: hours * EXTRA_RATE })

  // Bundle savings.
  if (bundle.key === 'launch' || bundle.key === 'allin') {
    const base = items.filter((i) => ['website', 'seo'].includes(i.key)).reduce((s, i) => s + i.cents, 0)
    once.push({ label: 'Launch Bundle saving', detail: '10% off Website Creation + SEO Setup', cents: -Math.round(base * LAUNCH_OFF), saving: true })
  }
  if (bundle.key === 'grow' || bundle.key === 'allin') {
    const base = items.filter((i) => ['grow', 'backlinks'].includes(i.key)).reduce((s, i) => s + i.cents, 0)
    if (base > GROW_BUNDLE) month.push({ label: 'Grow Bundle saving', detail: 'Both for $499.99 / month', cents: GROW_BUNDLE - base, saving: true })
  }

  // Lino's discounts, worked out on what's left after bundle savings.
  const sum = (lines) => lines.reduce((s, l) => s + l.cents, 0)
  const onceBase = sum(once)
  const monthBase = sum(month)
  for (const d of parseList(pkg.discounts)) {
    const value = Number(d.value) || 0
    if (value <= 0) continue
    const label = d.label || 'Discount'
    const months = Number(d.months) || 0
    const forMonths = months > 0 ? `for ${months} ${months === 1 ? 'month' : 'months'}` : ''
    if (d.kind === 'pct-once') once.push({ label, detail: `${value}% off`, cents: -pctOf(onceBase, Math.min(value, 100)) })
    if (d.kind === 'amt-once') once.push({ label, cents: -Math.round(value * 100) })
    if (d.kind === 'pct-month') month.push({ label, detail: [`${value}% off`, forMonths].filter(Boolean).join(' '), cents: -pctOf(monthBase, Math.min(value, 100)), months })
    if (d.kind === 'amt-month') month.push({ label, detail: forMonths, cents: -Math.round(value * 100), months })
    if (d.kind === 'ref-month') {
      const n = Math.min(Math.round(value), 3)
      month.push({ label: d.label || 'Referral credit', detail: `$25 off per referred business, for 6 months`, cents: -2500 * n, months: 6 })
    }
    if (d.kind === 'ref-once') once.push({ label: d.label || 'Referral credit', detail: `$50 per referred business`, cents: -5000 * Math.round(value) })
  }

  // Never below $0.
  const onceTotal = Math.max(0, sum(once))
  const monthTotal = Math.max(0, sum(month))
  const gst = Boolean(pkg.opt?.gst)
  const tax = (c) => (gst ? Math.round(c * GST_RATE) : 0)
  const depositPct = pkg.opt?.deposit ?? '50'
  const deposit = Math.round((onceTotal * Number(depositPct)) / 100)

  return {
    bundle,
    items,
    custom,
    once,
    month,
    onceTotal,
    monthTotal,
    gst,
    onceGst: tax(onceTotal),
    monthGst: tax(monthTotal),
    deposit,
    depositGst: tax(deposit),
    depositPct,
    growTerm: growTerm(pkg),
    hasMonthly: month.length > 0,
    empty: once.length === 0 && month.length === 0,
  }
}

export const money = (cents) =>
  `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Typed dollars ("1,250" or "$999.98") to cents; null if it isn't a number.
export function toCents(text) {
  const n = Number(String(text).replace(/[$,\s]/g, ''))
  return text !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null
}

export const centsText = (cents) => (Number.isFinite(cents) ? (cents / 100).toFixed(2) : '')

// Fills the proposal and service agreement from the package: the services
// ticked on the client and the price fields. Lino can still change any of it
// in the documents afterwards.
export function packageToDocs(pkg) {
  const calc = calcPackage(pkg)
  const ids = new Set(calc.items.map((i) => i.key))
  const changes = ITEMS.map((i) => ({ path: ['details', 'services', i.key], value: ids.has(i.key) }))
  const gstNote = calc.gst ? ' + GST' : ''
  const field = (doc, key, value) => changes.push({ path: ['docs', doc, 'fields', key], value: value || null })
  const growBundle = calc.bundle.key === 'grow' || calc.bundle.key === 'allin'

  const priceText = (i) => {
    if (growBundle && i.key === 'backlinks') return 'Included in the Grow Bundle'
    if (growBundle && i.key === 'grow') return '$499.99 per month (Grow Bundle, with Backlink Building)'
    return `${money(i.cents)} ${i.billing === 'once' ? 'one-time' : 'per month'}`
  }
  const priceField = { website: 'priceWebsite', seo: 'priceSeo', backlinks: 'priceBacklinks', grow: 'priceGrow' }
  for (const i of ITEMS) field('proposal', priceField[i.key], ids.has(i.key) ? priceText(calc.items.find((x) => x.key === i.key)) : null)

  const extras = [...calc.once, ...calc.month].filter((l) => l.cents < 0 || !ITEMS.some((i) => i.name === l.label))
  field(
    'proposal',
    'packageExtras',
    extras.map((l) => `${l.label}${l.detail ? ` (${l.detail})` : ''}: ${money(l.cents)}${calc.month.includes(l) ? ' per month' : ''}`).join('\n'),
  )

  const total = [calc.onceTotal > 0 && `${money(calc.onceTotal)} one-time`, calc.hasMonthly && `${money(calc.monthTotal)} per month`]
    .filter(Boolean)
    .join(' + ')
  field('proposal', 'total', total ? `${total}${gstNote}` : '')
  if (calc.onceTotal > 0 && calc.depositPct !== '0') field('proposal', 'deposit', `${calc.depositPct}% (${money(calc.deposit)}${gstNote})`)
  if (calc.depositPct === '0') field('proposal', 'deposit', '$0.00 (none)')
  if (pkg.opt?.date) field('proposal', 'proposalDate', pkg.opt.date)
  if (pkg.opt?.validUntil) field('proposal', 'validUntil', pkg.opt.validUntil)
  field('agreement', 'extraRate', '$35 per hour')
  if (ids.has('grow')) field('agreement', 'growTerm', calc.growTerm ? `${calc.growTerm} months` : 'none (month to month)')
  return changes
}

// Plain-text summary for the email to the client.
export function packageEmail(client, pkg) {
  const calc = calcPackage(pkg)
  const d = client.details
  const line = (l, suffix = '') => `- ${l.label}: ${money(l.cents)}${suffix}${l.detail ? ` (${l.detail})` : ''}`
  const gst = calc.gst ? ' + GST' : ''
  const parts = [
    `Hi ${d.contact || d.name},`,
    '',
    `Here is the package we put together for ${d.name}.`,
    '',
  ]
  if (calc.once.length) parts.push('One-time:', ...calc.once.map((l) => line(l)), `Total one-time: ${money(calc.onceTotal)}${gst}`, '')
  if (calc.month.length) parts.push('Monthly:', ...calc.month.map((l) => line(l, ' / month')), `Total each month: ${money(calc.monthTotal)}${gst}`, '')
  if (calc.onceTotal > 0 && calc.depositPct !== '0') parts.push(`To start: ${money(calc.deposit + calc.depositGst)} deposit before work begins.`, '')
  if (pkg.opt?.note) parts.push(pkg.opt.note, '')
  parts.push(
    "Once you're happy with it, I'll send the service agreement to sign.",
    '',
    'Lino',
    'LinoCon Digital',
    'linocondigital.com',
  )
  return parts.join('\n')
}

// What a new invoice in /finance can bill from a signed package, found by the
// client's file number. Only the choices that make sense for this package.
export function invoiceChoices(pkg) {
  const calc = calcPackage(pkg)
  const split = calc.onceTotal > 0 && !['0', '100'].includes(calc.depositPct)
  return [
    split && { value: 'deposit', label: `Deposit (${calc.depositPct}% of one-time work)` },
    split && { value: 'balance', label: 'Balance of one-time work' },
    calc.onceTotal > 0 && { value: 'once', label: 'All one-time work' },
    calc.monthTotal > 0 && { value: 'month', label: 'Monthly services, one month' },
    calc.onceTotal > 0 && calc.monthTotal > 0 && { value: 'all', label: 'One-time work + first month' },
  ].filter(Boolean)
}

// The invoice's lines for one of those choices: { description, service, amount }
// with amount in cents (below zero for savings and discounts).
export function invoiceLines(pkg, what, fileNo) {
  const calc = calcPackage(pkg)
  const bundleService = { launch: 'Launch Bundle', allin: 'Launch Bundle', grow: 'Grow Bundle' }[calc.bundle.key]
  const serviceOf = (label) => {
    const named = ['Website Creation', 'SEO Setup', 'Backlink Building', 'Grow Plan'].find((s) => s === label)
    if (named) return named
    if (label === 'Extra work') return 'Extra Work'
    if (label === 'Launch Bundle saving') return 'Launch Bundle'
    if (label === 'Grow Bundle saving') return 'Grow Bundle'
    return 'Other'
  }
  const toLine = (l, suffix = '') => ({
    description: `${l.label}${l.detail ? ` (${l.detail})` : ''}${suffix}`.slice(0, 120),
    service: serviceOf(l.label),
    amount: l.cents,
  })
  const work = calc.items.filter((i) => i.billing === 'once').map((i) => i.name)
  const workText = work.length ? work.join(' + ') : 'one-time work'
  const oneService = bundleService ?? (work.length === 1 ? serviceOf(work[0]) : 'Other')
  const file = fileNo ? `, file ${fileNo}` : ''

  let lines
  if (what === 'deposit') {
    lines = [{ description: `Deposit (${calc.depositPct}%) for ${workText}${file}`, service: oneService, amount: calc.deposit }]
  } else if (what === 'balance') {
    lines = [{ description: `Balance for ${workText}${file}`, service: oneService, amount: calc.onceTotal - calc.deposit }]
  } else {
    const once = what === 'month' ? [] : calc.once.map((l) => toLine(l))
    const month = what === 'once' ? [] : calc.month.map((l) => toLine(l, ', one month'))
    lines = [...once, ...month].filter((l) => l.amount !== 0)
  }
  // An invoice holds up to 10 lines; a longer package becomes one line.
  if (lines.length > 10) {
    const amount = lines.reduce((t, l) => t + l.amount, 0)
    lines = [{ description: `Services as in your package${file}`, service: oneService, amount }]
  }
  return lines.filter((l) => l.amount !== 0)
}
