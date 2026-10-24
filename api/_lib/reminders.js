// Payment reminders: once a day (a scheduled GitHub Action calls
// /api/portal?op=reminders), each sent, unpaid invoice gets an email to the
// client at 7 days before it's due, 3 days before, on the due day, and once
// when it's 2 days overdue. invoice.reminders = { <stage>: 'YYYY-MM-DD' }
// remembers what went out, so running it again sends nothing twice. A stage
// that fell on or before the day the invoice was sent is skipped (the
// invoice email just went out), and a client who said they sent an
// e-Transfer gets no more reminders for that invoice.
import { C, SITE, button, emailShell, esc, firstName, heading, signOff } from '../../src/lib/brandEmail.js'
import { listRecords, saveRecord } from './finance/records.js'
import { today } from './finance/summary.js'
import { isEmail, sendMail } from './mail.js'
import { addDays } from './schedule.js'
import { getClient, redis } from './store.js'

const STAGES = [
  { key: 'week', days: -7 },
  { key: 'soon', days: -3 },
  { key: 'today', days: 0 },
  { key: 'overdue', days: 2 },
]

const cad = (cents) => (cents / 100).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
const dateText = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

// The one reminder due today for this invoice, if any: the latest stage that
// has arrived and wasn't sent (an older missed stage isn't sent late).
export function stageFor(invoice, day) {
  const arrived = STAGES.filter((s) => addDays(invoice.due, s.days) <= day)
  const stage = arrived.at(-1)
  if (!stage || invoice.reminders?.[stage.key]) return null
  if (stage.days < 0 && addDays(invoice.due, stage.days) <= (invoice.sentOn || '')) return null
  return stage
}

const WORDING = {
  week: (due) => ['Friendly reminder', `is due on ${due}, in 7 days.`],
  soon: (due) => ['Your invoice is due in 3 days', `is due on ${due}.`],
  today: () => ['Your invoice is due today', 'is due today.'],
  overdue: (due) => ['Your invoice is overdue', `was due on ${due}. Please pay it as soon as you can.`],
}

export function reminderMail(client, invoice, stage) {
  const total = invoice.subtotal + (invoice.gst || 0)
  const [title, when] = WORDING[stage.key](dateText(invoice.due))
  const first = firstName(client)
  const line = `Invoice ${invoice.number} for ${cad(total)} ${when}`
  const paid = "If you've already paid, thank you, and please ignore this email."
  return {
    to: invoice.email || client.details.email?.trim(),
    subject: `${stage.key === 'overdue' ? 'Overdue' : 'Reminder'}: invoice ${invoice.number} from LinoCon Digital`,
    html: emailShell({
      badge: stage.key === 'overdue' ? 'OVERDUE' : 'PAYMENT REMINDER',
      rows: [
        heading(`${esc(title)}${first ? `, ${esc(first)}` : ''}.`, `<b style="color:${C.text};">${esc(line)}</b> ${esc(paid)}`),
        button(`${SITE}/clients#pay-now`, 'Pay now', 'Pay by card or Interac e-Transfer on your client page.'),
        signOff(),
      ],
      footer: `Prepared for ${esc(client.details.name)}`,
    }),
    text: [`Hi ${first || client.details.name},`, '', line, paid, '', `Pay now (card or Interac e-Transfer): ${SITE}/clients`, '', 'Lino', 'LinoCon Digital'].join('\n'),
  }
}

export async function sendReminders(day = today()) {
  // Once every 10 minutes at most, however often the address is called.
  if (!(await redis(['SET', 'remind:lock', '1', 'NX', 'EX', '600']))) return { skipped: true, sent: [] }
  const sent = []
  for (const invoice of await listRecords('invoice')) {
    if (invoice.status !== 'open' || !invoice.due || !invoice.number || !invoice.clientId) continue
    const stage = stageFor(invoice, day)
    if (!stage) continue
    const client = await getClient(invoice.clientId)
    if (!client || client.etransfer?.[invoice.number]) continue
    const mail = reminderMail(client, invoice, stage)
    if (!isEmail(mail.to)) continue
    try {
      await sendMail(mail)
    } catch (err) {
      console.error('reminder', invoice.number, err)
      continue
    }
    await saveRecord('invoice', { ...invoice, reminders: { ...invoice.reminders, [stage.key]: day } })
    sent.push(`${invoice.number} ${stage.key}`)
  }
  return { skipped: false, sent }
}
