// What a new client tells us they want, from the tap-to-choose form on their
// page (linocondigital.com/clients). Saved as client.wishes:
//   { hasSite: 'yes' | 'no', site, picks: { <choice id>: true }, when, note, sentAt }
// No imports, so the pages and the API share it.

export const WISH_CHOICES = [
  { id: 'new-site', label: 'A new website' },
  { id: 'fix-site', label: 'Fix or refresh my current website' },
  { id: 'google', label: 'Show up on Google' },
  { id: 'leads', label: 'More calls and enquiries' },
  { id: 'reviews', label: 'More Google reviews and a better Google Business Profile' },
  { id: 'backlinks', label: 'Links from other websites (backlinks)' },
  { id: 'monthly', label: 'Ongoing monthly help to keep growing' },
  { id: 'unsure', label: 'Not sure yet, help me decide' },
]

export const WISH_WHEN = [
  { id: 'asap', label: 'As soon as possible' },
  { id: 'soon', label: 'In the next 1 to 3 months' },
  { id: 'later', label: 'Later this year' },
  { id: 'looking', label: 'Just looking for now' },
]

const CHOICE_IDS = new Set(WISH_CHOICES.map((c) => c.id))
const WHEN_IDS = new Set(WISH_WHEN.map((w) => w.id))
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// The client's answers, cleaned. Returns null when nothing usable was picked.
export function cleanWishes(input = {}) {
  const picks = Object.fromEntries(
    (Array.isArray(input.picks) ? input.picks : []).filter((id) => CHOICE_IDS.has(id)).map((id) => [id, true]),
  )
  const hasSite = input.hasSite === 'yes' || input.hasSite === 'no' ? input.hasSite : null
  if (!hasSite || Object.keys(picks).length === 0) return null
  return {
    hasSite,
    site: hasSite === 'yes' ? text(input.site, 200) : '',
    picks,
    when: WHEN_IDS.has(input.when) ? input.when : '',
    note: text(input.note, 1000),
  }
}

export const hasWebsite = (client) => client.wishes?.hasSite === 'yes'

// A starting point for Lino's package choice, from what the client picked.
// Lino decides; this only points the way.
export function suggestPackage(wishes) {
  const p = wishes?.picks ?? {}
  const website = p['new-site'] || p['fix-site'] || wishes?.hasSite === 'no'
  const seo = p.google || p.leads
  const monthly = p.monthly || p.backlinks || p.reviews
  if (website && seo && monthly) return 'All-in Starter'
  if (website && seo) return 'Launch Bundle'
  if (website) return 'Website Creation'
  if (p.backlinks && (p.monthly || p.reviews)) return 'Grow Bundle'
  if (seo && monthly) return 'SEO Setup + Grow Plan'
  if (monthly) return 'Grow Plan'
  if (seo) return 'SEO Setup'
  return ''
}

export const wishLabel = (id) => WISH_CHOICES.find((c) => c.id === id)?.label ?? id
export const whenLabel = (id) => WISH_WHEN.find((w) => w.id === id)?.label ?? ''
