// The designed invite email a new client gets with their login code. Built as
// an email-safe HTML table with inline styles (what Gmail and Outlook keep),
// so Lino can copy it, paste it into a new Gmail message, and send.
import { dateLabel } from './clientProgress'

const SITE = 'https://linocondigital.com'
const LOGO = `${SITE}/email/linocon-logo-light.png`
const INK = '#0b0b10'
const BLUE = '#2e6bff'
const ORANGE = '#ff6a3d'
const TEXT = '#1b1b22'
const MUTED = '#5f6270'
const LINE = '#e6e6ea'
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const MONO = "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace"

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const INVITE_SUBJECT = 'Welcome to LinoCon Digital: your client page is ready'

// After # so the code never reaches the server logs or analytics.
export const inviteLink = (code) => `${SITE}/clients#invite=${encodeURIComponent(code)}`

const firstName = (client) => client.details.contact?.trim().split(/\s+/)[0] || ''

export function inviteText(client, code) {
  const first = firstName(client)
  return `Hi${first ? ` ${first}` : ''},

Welcome to LinoCon Digital. Your private client page is ready.

Your invite code: ${code.code}
(works once, expires ${dateLabel(code.expires)})

1. Open ${inviteLink(code.code)}
2. Your code is filled in for you. Enter your email and choose a password.
3. Next time, sign in at ${SITE}/clients with your email and password.

On your page you can tell us what you need, follow every step of your project, review your package and proposal, and sign your service agreement.

Lino
LinoCon Digital
linocondigital@gmail.com · linocondigital.com`
}

const step = (n, title, text) => `
<tr>
  <td valign="top" width="44" style="padding:0 0 18px 0;">
    <div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:${BLUE};color:#ffffff;font-family:${FONT};font-size:14px;font-weight:700;text-align:center;">${n}</div>
  </td>
  <td valign="top" style="padding:3px 0 18px 0;font-family:${FONT};">
    <div style="font-size:15px;font-weight:700;color:${TEXT};">${title}</div>
    <div style="font-size:14px;line-height:21px;color:${MUTED};padding-top:2px;">${text}</div>
  </td>
</tr>`

const perk = (text) => `
<tr>
  <td valign="top" width="22" style="padding:0 0 8px 0;font-family:${FONT};font-size:14px;color:${ORANGE};font-weight:700;">&#10003;</td>
  <td style="padding:0 0 8px 0;font-family:${FONT};font-size:14px;line-height:21px;color:${TEXT};">${text}</td>
</tr>`

export function inviteHtml(client, code, today = new Date()) {
  const first = esc(firstName(client))
  const business = esc(client.details.name)
  const link = inviteLink(code.code)
  const issued = today.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f2f4;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${LINE};">

  <tr><td style="background:${INK};padding:26px 32px 22px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle"><img src="${LOGO}" width="210" height="31" alt="LinoCon Digital" style="display:block;border:0;width:210px;height:31px;"></td>
      <td valign="middle" align="right" style="font-family:${FONT};">
        <span style="display:inline-block;padding:5px 12px;border-radius:999px;border:1px solid ${ORANGE};color:${ORANGE};font-size:11px;font-weight:700;letter-spacing:1.5px;white-space:nowrap;">CLIENT INVITE</span>
        <div style="color:#9a9caa;font-size:12px;padding-top:6px;">${issued}</div>
      </td>
    </tr></table>
    <div style="font-family:${FONT};color:#9a9caa;font-size:12px;letter-spacing:1.5px;padding-top:14px;">GET FOUND. GET CHOSEN. GET GROWING.</div>
  </td></tr>
  <tr><td height="4" style="height:4px;line-height:4px;font-size:0;background:${BLUE};background-image:linear-gradient(90deg, ${BLUE}, ${ORANGE});">&nbsp;</td></tr>

  <tr><td style="padding:34px 32px 8px 32px;font-family:${FONT};">
    <div style="font-size:26px;line-height:32px;font-weight:800;color:${TEXT};">Welcome${first ? `, ${first}` : ''}.</div>
    <div style="font-size:15px;line-height:23px;color:${MUTED};padding-top:10px;">Your private client page for <b style="color:${TEXT};">${business}</b> is ready. It's where we'll work together on your project, step by step.</div>
  </td></tr>

  <tr><td style="padding:22px 32px 6px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f7fb;border:1px solid ${LINE};border-radius:12px;">
      <tr><td align="center" style="padding:22px 16px;font-family:${FONT};">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${MUTED};">YOUR INVITE CODE</div>
        <div style="font-family:${MONO};font-size:26px;line-height:36px;font-weight:700;letter-spacing:2px;white-space:nowrap;color:${INK};padding-top:8px;">${esc(code.code)}</div>
        <div style="font-size:12px;color:${MUTED};padding-top:6px;">Works once &middot; expires ${esc(dateLabel(code.expires))}</div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:22px 32px 6px 32px;">
    <a href="${link}" style="display:inline-block;background:${BLUE};background-image:linear-gradient(120deg, ${BLUE}, ${ORANGE});color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;text-decoration:none;padding:15px 34px;border-radius:999px;">Set up my login &rarr;</a>
    <div style="font-family:${FONT};font-size:12px;color:${MUTED};padding-top:10px;">Your code is filled in for you when you tap the button.</div>
  </td></tr>

  <tr><td style="padding:28px 32px 4px 32px;">
    <div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:2px;color:${MUTED};padding-bottom:16px;">HOW TO SIGN IN</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${step(1, 'Tap "Set up my login"', `Or go to <a href="${SITE}/clients" style="color:${BLUE};">linocondigital.com/clients</a> and tap "I have an invite code".`)}
      ${step(2, 'Choose your password', 'Enter your email and choose a password of at least 10 characters.')}
      ${step(3, "You're in", 'Next time, sign in at the same page with your email and password.')}
    </table>
  </td></tr>

  <tr><td style="padding:6px 32px 8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">
      <tr><td style="padding-top:22px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:2px;color:${MUTED};padding-bottom:12px;">ON YOUR PAGE YOU CAN</td></tr>
      <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${perk('Tell us what you need, with a few taps')}
        ${perk('Follow every step of your project as it happens')}
        ${perk('Review your package and proposal, and ask for changes')}
        ${perk('Sign your service agreement online')}
      </table></td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:22px 32px 30px 32px;font-family:${FONT};">
    <div style="font-size:15px;line-height:23px;color:${TEXT};">Questions? Just reply to this email.</div>
    <div style="font-size:15px;line-height:22px;color:${TEXT};padding-top:16px;font-weight:700;">Lino</div>
    <div style="font-size:14px;line-height:20px;color:${MUTED};">LinoCon Digital &middot; Vancouver, BC</div>
  </td></tr>

  <tr><td style="background:${INK};padding:18px 32px;font-family:${FONT};font-size:12px;line-height:18px;color:#9a9caa;">
    <a href="${SITE}" style="color:#ffffff;text-decoration:none;font-weight:700;">linocondigital.com</a> &middot; <a href="mailto:linocondigital@gmail.com" style="color:#9a9caa;text-decoration:none;">linocondigital@gmail.com</a><br>
    This code is private to ${business}. If you weren't expecting it, you can ignore this email.
  </td></tr>

</table>
</td></tr>
</table>`
}
