// Sends the designed emails (welcome, package) straight to the client from
// linocondigital@gmail.com, so they arrive with their look and show in
// Gmail's Sent folder. Needs GMAIL_APP_PASSWORD in Vercel: a Google app
// password for that account (Google Account, Security, App passwords).
// Locally, without it, emails are only logged.
import nodemailer from 'nodemailer'

const FROM = 'linocondigital@gmail.com'
const user = () => process.env.GMAIL_USER?.trim() || FROM
const password = () => process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '')

export const mailReady = () => Boolean(password() || process.env.LCD_MEMORY_STORE)

export const isEmail = (s) => typeof s === 'string' && s.length <= 254 && /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(s)

export async function sendMail({ to, subject, html, text }) {
  if (!password()) {
    console.log('[mail] local only, not sent:', to, subject, html.length)
    return
  }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: user(), pass: password() } })
  await transport.sendMail({ from: { name: 'Lino at LinoCon Digital', address: user() }, to, subject, html, text })
}
