// What a signed-in client can write on their own page (see api/portal.js):
// what they want (step 2), a request for changes to the package or proposal
// (step 4), and the "What you already have" checklist (step 6). Everything
// else on the client record is Lino's.
import { cleanWishes } from './wishes.js'

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function saveWishes(client, input) {
  const wishes = cleanWishes(input)
  if (!wishes) return 'wishes'
  client.wishes = { ...wishes, sentAt: new Date().toISOString() }
  return 'ok'
}

// The package or proposal Lino sent isn't quite right yet.
export function askChanges(client, doc, note) {
  if (doc !== 'package' && doc !== 'proposal') return 'unknown'
  const state = client.docs?.[doc]
  if (state?.status !== 'sent') return 'not-sent'
  const cleaned = text(note, 2000)
  if (cleaned.length < 2) return 'note'
  state.changes = { note: cleaned, at: new Date().toISOString() }
  return 'ok'
}

const HAS_VALUES = new Set(['yes', 'no', 'unsure'])
const isHasId = (id) => typeof id === 'string' && /^has\.[a-z0-9.-]{1,76}$/.test(id) && !id.endsWith('.note')

// answers: [{ id, value?, note? }], and done: true once they've finished.
export function saveHas(client, answers, done) {
  if (!Array.isArray(answers) || answers.length > 60) return 'has'
  const has = { ...client.has }
  for (const a of answers) {
    if (!isHasId(a?.id)) return 'has'
    if ('value' in a) {
      if (a.value === null) delete has[a.id]
      else if (HAS_VALUES.has(a.value)) has[a.id] = a.value
      else return 'has'
    }
    if ('note' in a) {
      const note = text(a.note, 500)
      if (note) has[`${a.id}.note`] = note
      else delete has[`${a.id}.note`]
    }
  }
  if (Object.keys(has).length > 200) return 'has'
  client.has = has
  if (done === true) client.infoSentAt = new Date().toISOString()
  return 'ok'
}
