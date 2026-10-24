// The designed emails for the proposal and the service agreement (see
// src/lib/brandEmail.js for the look): "ready to review" and "your signed
// copy". Each has a plain text twin for email apps that don't show HTML.
import { C, SITE, button, emailShell, esc, firstName, heading, signOff, steps } from './brandEmail'
import { DOCS } from './clientDocs'

const docLink = (docKey) => `${SITE}/clients/${docKey}`
const dot = (s) => (s.endsWith('.') ? '' : '.')

const READY = {
  proposal: {
    badge: 'YOUR PROPOSAL',
    title: 'Your proposal is ready',
    intro: (b) => `We've put together a proposal for <b style="color:${C.text};">${b}</b>${dot(b)} It sets out the work, the timeline and the price.`,
    button: 'Review my proposal',
    note: 'Sign in to your client page to accept it or ask for changes.',
    steps: [
      ['Read it over', 'Everything is on your client page, where you can also save it as a PDF.'],
      ['Accept or ask for changes', 'One click to accept, or tell us what you would like changed.'],
      ['Sign the service agreement', "Once you're happy, we send the agreement to sign online."],
    ],
  },
  agreement: {
    badge: 'SERVICE AGREEMENT',
    title: 'Your service agreement is ready to sign',
    intro: (b) => `The service agreement for <b style="color:${C.text};">${b}</b> is ready. It takes a couple of minutes to sign online.`,
    button: 'Review and sign',
    note: 'Sign in to your client page with your email and password.',
    steps: [
      ['Read it over', 'It covers the work, the prices and how we work together.'],
      ['Sign online', 'Type your name, tick "I agree" and press Sign.'],
      ['We countersign', 'You get your signed copy by email, and work starts once the deposit is in.'],
    ],
  },
}

export const readySubject = (client, docKey) => `Your ${DOCS[docKey].name.toLowerCase()} from LinoCon Digital: ${client.details.name}`

export function readyHtml(client, docKey) {
  const t = READY[docKey]
  const first = esc(firstName(client))
  const business = esc(client.details.name)
  return emailShell({
    badge: t.badge,
    rows: [
      heading(`${t.title}${first ? `, ${first}` : ''}.`, t.intro(business)),
      button(docLink(docKey), t.button, t.note),
      steps("WHAT'S NEXT", t.steps),
      signOff(),
    ],
    footer: `Prepared for ${business}${dot(business)}`,
  })
}

export function readyText(client, docKey) {
  const d = client.details
  const verb = docKey === 'agreement' ? 'sign' : 'accept'
  return [
    `Hi ${firstName(client) || d.name},`,
    '',
    `Your ${DOCS[docKey].name.toLowerCase()} is ready. You can read it and ${verb} it online on your client page:`,
    docLink(docKey),
    '',
    'Questions? Just reply to this email.',
    '',
    'Lino',
    'LinoCon Digital',
  ].join('\n')
}

export const signedSubject = (client, docKey) => `Your signed ${DOCS[docKey].name.toLowerCase()}: ${client.details.name}`

export function signedHtml(client, docKey, signer) {
  const doc = DOCS[docKey]
  const first = esc(firstName(client) || signer || '')
  const business = esc(client.details.name)
  const name = doc.name.toLowerCase()
  return emailShell({
    badge: doc.signatures ? 'SIGNED' : 'ACCEPTED',
    rows: [
      heading(
        `Thank you${first ? `, ${first}` : ''}.`,
        doc.signatures
          ? `The ${name} for <b style="color:${C.text};">${business}</b> is now signed by both of us.`
          : `You accepted the ${name} for <b style="color:${C.text};">${business}</b>.`,
      ),
      button(docLink(docKey), 'View my signed copy', 'Open it on your client page and choose "Save as PDF" to keep a copy.'),
      signOff(),
    ],
    footer: `Prepared for ${business}${dot(business)}`,
  })
}

export function signedText(client, docKey, signer) {
  const doc = DOCS[docKey]
  return [
    `Hi ${firstName(client) || signer || client.details.name},`,
    '',
    doc.signatures
      ? `Thank you for signing. The ${doc.name.toLowerCase()} is now signed by both of us.`
      : `Thank you for accepting the ${doc.name.toLowerCase()}.`,
    '',
    `Your copy is on your client page: ${docLink(docKey)}`,
    'Sign in, open it and click "Save as PDF" to keep a copy.',
    '',
    'Lino',
    'LinoCon Digital',
  ].join('\n')
}
