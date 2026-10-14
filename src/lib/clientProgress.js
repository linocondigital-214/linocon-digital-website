// Helpers for the client progress pages: the stages, progress maths and the
// calls to /api (see api/ at the project root).
import { useEffect } from 'react'
import { AUDIT, PLAN, BUILD, GROW_SETUP, GROW_MONTHLY, GROW_QUARTERLY } from './clientChecklist'

export const STAGES = [
  { key: 'audit', n: '01', name: 'Audit', verb: 'Understand', line: 'Find what is holding the business back before we build anything.', sections: AUDIT },
  { key: 'plan', n: '02', name: 'Plan', verb: 'Decide', line: 'Turn the Audit into a clear, prioritized roadmap.', sections: PLAN },
  { key: 'build', n: '03', name: 'Build & Launch', verb: 'Execute', line: 'Turn the strategy into a fast, search-ready, conversion-focused website.', sections: BUILD },
  { key: 'grow', n: '04', name: 'Grow', verb: 'Compound', line: 'Launch is the starting line. Keep improving. Keep getting found.' },
]

export const SERVICES = [
  { key: 'website', name: 'Website Creation' },
  { key: 'seo', name: 'SEO Setup' },
  { key: 'backlinks', name: 'Backlink Building' },
  { key: 'grow', name: 'Ongoing Grow plan' },
]

// "Baseline vs today" in the Grow stage. Real numbers only, typed in by Lino.
export const METRICS = [
  { key: 'clicks', name: 'Organic clicks / month' },
  { key: 'impressions', name: 'Search impressions / month' },
  { key: 'enquiries', name: 'Enquiries / month' },
  { key: 'keywords', name: 'Priority keywords on page 1' },
  { key: 'reviews', name: 'Google reviews' },
  { key: 'domains', name: 'Referring domains' },
]

export const LOG_FIELDS = [
  { key: 'saw', name: 'What we measured / saw' },
  { key: 'why', name: 'Why it changed' },
  { key: 'improved', name: 'What we improved' },
  { key: 'next', name: 'Next priority' },
]

const stageItems = (stage) => stage.sections.flatMap((s) => s.items)
export const monthlyItems = () => GROW_MONTHLY.flatMap((g) => g.items)
export const quarterlyItems = () => GROW_QUARTERLY.flatMap((g) => g.items)

// Items marked N/A don't count towards progress.
export function countDone(items, done = {}, na = {}) {
  const counted = items.filter((i) => !na[i.id])
  return { done: counted.filter((i) => done[i.id]).length, total: counted.length }
}

export function stageProgress(client, stage) {
  const items = stage.key === 'grow' ? GROW_SETUP : stageItems(stage)
  return countDone(items, client.done, client.na)
}

export const percent = ({ done, total }) => (total ? Math.round((done / total) * 100) : 0)

// A stage is complete once the client has signed it off, or every task is ticked.
export function stageStatus(client, stage) {
  const p = stageProgress(client, stage)
  if (stage.key !== 'grow' && (client.signoff?.[stage.key] || (p.total && p.done === p.total))) return 'done'
  if (p.done > 0 || (stage.key === 'grow' && Object.keys(client.months ?? {}).length)) return 'active'
  return 'todo'
}

export function currentStage(client) {
  return STAGES.find((s) => s.key === 'grow' || stageStatus(client, s) !== 'done')
}

export function overallProgress(client) {
  return STAGES.slice(0, 3).reduce(
    (sum, s) => {
      const p = stageProgress(client, s)
      return { done: sum.done + p.done, total: sum.total + p.total }
    },
    { done: 0, total: 0 },
  )
}

// Grow months, oldest first, numbered from the first month of Grow.
// Every third month also carries the quarterly review.
export function growMonths(client) {
  return Object.keys(client.months ?? {})
    .sort()
    .map((key, i) => ({ key, number: i + 1, quarterly: (i + 1) % 3 === 0, ...client.months[key] }))
}

export function nextMonthKey(client) {
  const keys = Object.keys(client.months ?? {}).sort()
  const now = new Date()
  if (!keys.length) return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [y, m] = keys[keys.length - 1].split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}

export const monthLabel = (key) =>
  new Date(`${key}-15T12:00:00`).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })

export const dateLabel = (iso) =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const clientLink = (id) => `${window.location.origin}/progress/${id}`

// ---------- admin password (kept on Lino's own devices) ----------

const PASSWORD_KEY = 'lcd-admin-password'

export function savedPassword() {
  try {
    return localStorage.getItem(PASSWORD_KEY) || ''
  } catch {
    return ''
  }
}

export function rememberPassword(password) {
  try {
    if (password) localStorage.setItem(PASSWORD_KEY, password)
    else localStorage.removeItem(PASSWORD_KEY)
  } catch {
    // Private browsing: Lino just types it again next time.
  }
}

// ---------- API ----------

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`)
    this.status = status
    this.code = body?.error
  }
}

async function api(path, { password, method = 'GET', body } = {}) {
  const options = { method, headers: password ? { 'X-Admin-Password': password } : {} }
  if (body) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  const res = await fetch(path, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const fetchClient = (id, password) => api(`/api/client?id=${encodeURIComponent(id)}`, { password }).then((d) => d.client)
export const fetchClients = (password) => api('/api/clients', { password }).then((d) => d.clients)
export const createClient = (password, details) =>
  api('/api/clients', { password, method: 'POST', body: { details } }).then((d) => d.client)
export const changeClient = (password, id, changes) =>
  api(`/api/client?id=${encodeURIComponent(id)}`, { password, method: 'PATCH', body: { changes } }).then((d) => d.client)
export const removeClient = (password, id) =>
  api(`/api/client?id=${encodeURIComponent(id)}`, { password, method: 'DELETE' })

// Keeps these private pages out of Google, alongside the X-Robots-Tag header
// set in vercel.json.
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}
