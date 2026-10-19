// Money in that Lino records by hand (e-Transfer, cash, cheque), and the
// choices the income form offers. Stripe payments arrive on their own (stripe.js).
import { Invalid } from './expenses.js'

export const SERVICES = [
  'Website Creation',
  'SEO Setup',
  'Backlink Building',
  'Grow Plan',
  'Grow Bundle',
  'Launch Bundle',
  'LinoCon Complete',
  'Extra Work',
  'Other',
]

export const RECEIVED_BY = ['e-Transfer', 'Cash', 'Cheque', 'Other']

const DATE = /^\d{4}-\d{2}-\d{2}$/
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const cents = (v) => (Number.isInteger(v) && v >= 0 && v <= 100_000_000 ? v : null)

// The parts of any income record Lino can change, Stripe ones included.
export function cleanLabels(input = {}, clients) {
  const service = SERVICES.includes(input.service) ? input.service : null
  if (!service) throw new Invalid('Pick the service this was for.')
  const client = input.clientId ? clients.find((c) => c.id === input.clientId) : null
  if (input.clientId && !client) throw new Invalid('That client isn’t in your client list any more.')
  const name = client?.details.name ?? text(input.client, 80)
  return { service, clientId: client?.id ?? null, client: name, note: text(input.note, 300) }
}

// A manual payment. Amounts arrive as whole cents; amount is before GST.
export function cleanIncome(input = {}, clients) {
  const date = text(input.date, 10)
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) throw new Invalid('Pick the date you were paid.')
  const amount = cents(input.amount)
  if (!amount) throw new Invalid('Type the amount you were paid.')
  const gst = input.gst === null || input.gst === undefined || input.gst === '' ? 0 : cents(input.gst)
  if (gst === null || gst > amount) throw new Invalid('The GST part doesn’t look right.')
  const labels = cleanLabels(input, clients)
  if (!labels.client) throw new Invalid('Pick a client or type who paid you.')
  const receivedBy = RECEIVED_BY.includes(input.receivedBy) ? input.receivedBy : RECEIVED_BY[0]
  return { date, amount, gst, fee: 0, ...labels, receivedBy }
}
