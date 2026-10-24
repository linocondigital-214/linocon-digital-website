// Progress emails, sent by the site on their own as a client moves through
// the journey (src/lib/journey.js): when Lino does a step, the client gets
// an update with a link to their page; when the client does one, Lino gets
// one with a link to their profile. client.notified = { <milestone>: ISO }
// remembers what was already announced, so each goes out once. Only real
// progress counts, not steps Lino marks done by hand.
import { SITE, C, button, emailShell, esc, firstName, heading, row, signOff } from '../../src/lib/brandEmail.js'
import { LINO_EMAIL, isEmail, sendMail } from './mail.js'
import { billingFor } from './paid.js'
import { loginStatus } from './portal.js'
import { launchDate, workStart } from './schedule.js'
import { getClient, saveClient } from './store.js'

const dateText = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const signed = (client, doc) => client.docs?.[doc]?.status === 'signed'

// by: who did it. lino: the line in Lino's email. client: the client's email.
export const MILESTONES = [
  { key: 'joined', by: 'client', done: (c, x) => x.joined, lino: 'set up their client login', next: 'Wait for them to send what they want, then pick their package.' },
  { key: 'wishes', by: 'client', done: (c) => c.wishes?.sentAt, lino: 'sent what they want', next: 'Pick their package in the package builder.' },
  {
    key: 'accepted',
    by: 'client',
    done: (c) => signed(c, 'package') && signed(c, 'proposal'),
    lino: 'accepted the package and signed the proposal',
    next: 'Sign the proposal on your side.',
  },
  {
    key: 'countersign',
    by: 'you',
    done: (c) => signed(c, 'proposal') && c.docs.proposal.ownerName,
    client: () => ['We signed your proposal', 'Your proposal is now signed by both of us. You can print it or save it as a PDF from your client page. Your service agreement comes next.'],
  },
  { key: 'agreementSigned', by: 'client', done: (c) => signed(c, 'agreement'), lino: 'signed the service agreement', next: 'Countersign it, then make the invoice.' },
  {
    key: 'agreement',
    by: 'you',
    done: (c) => signed(c, 'agreement') && c.docs.agreement.ownerName,
    client: () => ['Your service agreement is signed', 'Your service agreement is now signed by both of us, and a copy is on your client page. Your invoice comes next, by email.'],
  },
  { key: 'paid', by: 'client', done: (c, x) => x.paid, lino: 'paid their invoice', next: 'Work has started. Check the target launch date on their profile.' },
  {
    key: 'start',
    by: 'you',
    done: (c, x) => x.paid && x.start,
    client: (c, x) => [
      'Your project has started',
      `Thank you for your payment. Work on your project has started${x.launch ? `, and we are aiming to launch on ${dateText(x.launch)}` : ''}.${
        c.infoSentAt ? '' : ' Next, tell us what you already have (logo, photos, accounts) on your client page.'
      }`,
    ],
  },
  { key: 'info', by: 'client', done: (c) => c.infoSentAt, lino: 'finished the "What you already have" checklist', next: 'See their answers on their profile.' },
]

export function toClient(client, [title, text]) {
  const first = firstName(client)
  const business = esc(client.details.name)
  return {
    to: client.details.email?.trim(),
    subject: `${title}: ${client.details.name}`,
    html: emailShell({
      badge: 'PROJECT UPDATE',
      rows: [heading(`${esc(title)}${first ? `, ${esc(first)}` : ''}.`, esc(text)), button(`${SITE}/clients`, 'See your progress', 'Sign in with your email and password.'), signOff()],
      footer: `Prepared for ${business}`,
    }),
    text: [`Hi ${first || client.details.name},`, '', text, '', `See your progress: ${SITE}/clients`, '', 'Lino', 'LinoCon Digital'].join('\n'),
  }
}

export function toLino(client, m) {
  const name = client.details.name
  const link = `${SITE}/admin/${client.id}`
  return {
    to: LINO_EMAIL,
    copy: false,
    subject: `Client update: ${name} ${m.lino}`,
    html: emailShell({
      badge: 'CLIENT UPDATE',
      rows: [heading(`${esc(name)} ${esc(m.lino)}.`, `<b style="color:${C.text};">Your next step:</b> ${esc(m.next)}`), button(link, 'Open their profile'), row('', '6px 32px 26px 32px')],
    }),
    text: `${name} ${m.lino}.\n\nYour next step: ${m.next}\n\n${link}`,
  }
}

// Sends the emails for anything new since last time. Returns true when
// client.notified changed, so the caller saves the client.
export async function notifyProgress(client) {
  const [billing, login] = await Promise.all([billingFor(client.id), loginStatus(client.id)])
  const paidOn = billing.paidOn || client.schedule?.depositOn || null
  const when = workStart(client, paidOn)
  const facts = { joined: Boolean(login.account), paid: Boolean(paidOn), start: when.start, launch: launchDate(client, when.start) }
  const done = new Set(MILESTONES.filter((m) => m.done(client, facts)).map((m) => m.key))
  const first = !client.notified
  const notified = { ...client.notified }
  let changed = first

  for (const m of MILESTONES) {
    if (!done.has(m.key)) {
      // Undone (say, a document set back to Sent to sign again): announce it again next time.
      if (notified[m.key]) {
        delete notified[m.key]
        changed = true
      }
      continue
    }
    if (notified[m.key]) continue
    notified[m.key] = new Date().toISOString()
    changed = true
    // The first check only remembers what was already done.
    if (first) continue
    const mail = m.by === 'client' ? toLino(client, m) : toClient(client, m.client(client, facts))
    if (!isEmail(mail.to)) continue
    try {
      await sendMail(mail)
    } catch (err) {
      console.error('progress email', m.key, err)
    }
  }
  if (changed) client.notified = notified
  return changed
}

// For clients changed somewhere else (a payment in /finance).
export async function notifyClients(ids) {
  for (const id of new Set(ids)) {
    const client = id && (await getClient(id))
    if (client && (await notifyProgress(client))) await saveClient(client)
  }
}
