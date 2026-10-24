// The client journey: Lino's steps from invite to the start of work, shown
// at the top of each client in /admin and on the client's own page.
//   1 Invite          the client sets up their login
//   2 What they want  the client taps their choices and presses Send
//   * Review site     only for clients who already have a website
//   3 Pick package    Lino chooses the package in the package builder
//   4 Package + proposal  Lino sends both; the client accepts the package and
//                     signs the proposal, or asks for changes
//   5 Countersign     Lino signs the proposal too; the client can print it
//   6 Agreement       the client signs first, then Lino countersigns (file number)
//   7 Invoice         Lino sends the invoice from /finance with the file number
//   8 Pay             the client pays it with Pay now
//   9 Start           work starts; target launch from the agreement's weeks
//  10 Their info      the client fills in "What you already have"
// Each step is { key, name, done, turn: 'you' | 'client' | null, line }.
// Lino can mark any step as done by hand (client.journey) for clients who
// started before these steps existed. client.billing comes from the API
// (api/_lib/paid.js).
import { addDays, workStart } from '../../api/_lib/schedule.js'
import { hasWebsite, suggestPackage } from '../../api/_lib/wishes.js'
import { money, pkgState } from './packages'
import { dateLabel } from './clientProgress'

// A saved timestamp as the local day it happened on.
const dayOf = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const status = (client, doc) => client.docs?.[doc]?.status || 'draft'
const hasPackage = (pkg) => Boolean(pkg.bundle || Object.values(pkg.on ?? {}).some(Boolean) || pkg.custom)

// The target launch: the date Lino set, or the start of work plus the
// agreement's "Weeks from start to launch".
export function launchDate(client, start) {
  if (client.schedule?.launchOn) return client.schedule.launchOn
  const weeks = parseInt(client.docs?.agreement?.fields?.launchWeeks, 10)
  return start && weeks > 0 && weeks < 200 ? addDays(start, weeks * 7) : null
}

export function journeySteps(client, { joined, invited } = {}) {
  const manual = client.journey ?? {}
  const pkg = pkgState(client)
  const sent = (doc) => ['sent', 'signed'].includes(status(client, doc))
  const accepted = status(client, 'package') === 'signed' && status(client, 'proposal') === 'signed'
  const changes = ['package', 'proposal'].map((d) => client.docs?.[d]).find((d) => d?.status === 'sent' && d.changes)
  const agreement = client.docs?.agreement ?? {}
  const paidOn = client.paidOn ?? client.billing?.paidOn ?? null
  const when = workStart(client, paidOn)
  const proposal = client.docs?.proposal ?? {}
  const billing = client.billing ?? { invoiced: false, unpaid: [] }
  const owing = billing.unpaid?.[0]
  const paid = Boolean(paidOn || client.schedule?.depositOn)
  const launch = launchDate(client, when.start)

  const steps = [
    {
      key: 'invite',
      name: 'Invite',
      done: Boolean(joined),
      turn: invited ? 'client' : 'you',
      line: joined ? 'Client has set up their login' : invited ? 'Invite sent. Waiting for the client to create their login' : 'Send the invite code, then the client creates their login',
    },
    {
      key: 'wishes',
      name: 'What they want',
      done: Boolean(client.wishes?.sentAt),
      turn: 'client',
      line: client.wishes?.sentAt ? `Sent ${dateLabel(dayOf(client.wishes.sentAt))}` : 'Client taps what they want and presses Send',
    },
    hasWebsite(client) && {
      key: 'review',
      name: 'Review their current website',
      done: false,
      turn: 'you',
      line: client.wishes.site ? `Look over ${client.wishes.site} before choosing the package` : 'Look over their website before choosing the package',
    },
    {
      key: 'package',
      name: 'Pick the package',
      done: hasPackage(pkg),
      turn: 'you',
      line: hasPackage(pkg)
        ? 'Package chosen'
        : suggestPackage(client.wishes)
          ? `Suggested from their answers: ${suggestPackage(client.wishes)}`
          : 'Choose the package in the package builder',
    },
    {
      key: 'proposal',
      name: 'Send package + proposal',
      done: accepted,
      turn: changes ? 'you' : sent('package') && sent('proposal') ? 'client' : 'you',
      line: accepted
        ? 'Client accepted the package and signed the proposal'
        : changes
          ? 'Client asked for changes'
          : sent('package') && sent('proposal')
            ? 'Waiting for the client to accept the package and sign the proposal'
            : 'Mark the package and proposal as Sent so the client can see them',
      changes: changes?.changes,
    },
    {
      key: 'countersign',
      name: 'Sign the proposal',
      done: proposal.status === 'signed' && Boolean(proposal.ownerName),
      turn: 'you',
      line: proposal.ownerName
        ? 'Signed by both of you'
        : proposal.status === 'signed'
          ? 'Client signed. Sign it on your side, then send them their signed copy'
          : 'You sign once the client has signed',
    },
    {
      key: 'agreement',
      name: 'Service agreement',
      done: agreement.status === 'signed' && Boolean(agreement.ownerName),
      turn: agreement.status === 'sent' ? 'client' : 'you',
      line:
        agreement.status === 'signed'
          ? agreement.ownerName
            ? `Signed by both of you${client.fileNo ? `. File number ${client.fileNo}` : ''}`
            : 'Client signed. Countersign it now'
          : agreement.status === 'sent'
            ? 'Waiting for the client to sign first'
            : 'Mark the agreement as Sent so the client can sign it',
    },
    {
      key: 'invoice',
      name: 'Send the invoice',
      done: Boolean(billing.invoiced || paid),
      turn: 'you',
      line: billing.invoiced || paid
        ? 'Invoice sent'
        : client.fileNo
          ? `Make the invoice in Finance with file number ${client.fileNo}, then send it`
          : 'Make the invoice once the agreement is signed',
    },
    {
      key: 'pay',
      name: 'Client pays',
      done: paid,
      turn: 'client',
      line: paid
        ? `Paid ${dateLabel(paidOn || client.schedule.depositOn)}`
        : owing
          ? `Waiting for invoice${owing.number ? ` ${owing.number}` : ''} (${money(owing.total)})${owing.due ? `, due ${dateLabel(owing.due)}` : ''}`
          : 'Waiting for the client to pay the invoice',
      owing,
    },
    {
      key: 'start',
      name: 'Start the project',
      done: Boolean(when.start && paid && launch),
      turn: 'you',
      line: !when.start || !paid
        ? 'Work starts once the invoice is paid'
        : launch
          ? `Work started ${dateLabel(when.start)}. Target launch ${dateLabel(launch)}`
          : `Work started ${dateLabel(when.start)}. Set the target launch date`,
      launch,
    },
    {
      key: 'info',
      name: 'Collect their info',
      done: Boolean(client.infoSentAt),
      turn: 'client',
      line: client.infoSentAt
        ? `Client finished the checklist ${dateLabel(dayOf(client.infoSentAt))}`
        : 'Client fills in "What you already have" on their page',
    },
  ].filter(Boolean)

  return steps.map((s) => {
    if (s.done || !manual[s.key]) return s
    return { ...s, done: true, manual: manual[s.key], line: `Marked done ${dateLabel(manual[s.key])}` }
  })
}

// The first step that isn't done, or null once every step is.
export const currentStep = (steps) => steps.find((s) => !s.done) ?? null
