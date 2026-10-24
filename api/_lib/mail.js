// Sends the designed emails (welcome, package) straight to the client, so
// they arrive with their look. Two ways, whichever is set up in Vercel:
//   RESEND_API_KEY      Resend (resend.com), from lino@linocondigital.com once
//                       the domain is verified there. Replies go to Gmail and
//                       a copy goes to Gmail too.
//   GMAIL_APP_PASSWORD  a Google app password for linocondigital@gmail.com;
//                       the email shows in Gmail's Sent folder.
// Locally, without either, emails are only logged.
import nodemailer from 'nodemailer'

const GMAIL = 'linocondigital@gmail.com'
const NAME = 'Lino at LinoCon Digital'
const gmailUser = () => process.env.GMAIL_USER?.trim() || GMAIL
const gmailPassword = () => process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '')
const resendKey = () => process.env.RESEND_API_KEY?.trim()
const resendFrom = () => process.env.MAIL_FROM?.trim() || 'lino@linocondigital.com'

export const mailReady = () => Boolean(resendKey() || gmailPassword() || process.env.LCD_MEMORY_STORE)

export const isEmail = (s) => typeof s === 'string' && s.length <= 254 && /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(s)

export class MailError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

export async function sendMail({ to, subject, html, text }) {
  if (resendKey()) return sendResend({ to, subject, html, text })
  if (!gmailPassword()) {
    console.log('[mail] local only, not sent:', to, subject, html.length)
    return
  }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: gmailUser(), pass: gmailPassword() } })
  try {
    await transport.sendMail({ from: { name: NAME, address: gmailUser() }, to, subject, html, text })
  } catch (err) {
    if (err?.code === 'EAUTH') throw new MailError('mail-auth', "Gmail didn't accept the app password. Check GMAIL_APP_PASSWORD in Vercel.")
    throw err
  }
}

async function sendResend({ to, subject, html, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `${NAME} <${resendFrom()}>`, to: [to], bcc: [GMAIL], reply_to: GMAIL, subject, html, text }),
  })
  if (res.ok) return
  const body = await res.json().catch(() => ({}))
  console.error('Resend', res.status, body)
  if (res.status === 401 || res.status === 403) {
    throw new MailError('mail-auth', 'Resend refused to send. Check that linocondigital.com shows Verified in Resend and that RESEND_API_KEY in Vercel is right.')
  }
  throw new Error(`Resend ${res.status}`)
}
