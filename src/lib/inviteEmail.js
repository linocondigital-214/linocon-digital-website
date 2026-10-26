// The designed welcome email a new client gets with their login code (see
// src/lib/brandEmail.js for the look). Lino copies it and pastes it into Gmail.
import { C, FONT, MONO, SITE, button, checks, emailShell, esc, firstName, heading, row, signOff, steps } from './brandEmail'
import { dateLabel } from './clientProgress'

export const INVITE_SUBJECT = 'Welcome to LinoCon Digital: your client page is ready'

// After # so the code never reaches the server logs or analytics.
export const inviteLink = (code) => `${SITE}/clients#invite=${encodeURIComponent(code)}`

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
office@linocondigital.com · linocondigital.com`
}

export function inviteHtml(client, code) {
  const first = esc(firstName(client))
  const business = esc(client.details.name)
  return emailShell({
    badge: 'CLIENT INVITE',
    rows: [
      heading(`Welcome${first ? `, ${first}` : ''}.`, `Your private client page for <b style="color:${C.text};">${business}</b> is ready. It's where we'll work together on your project, step by step.`),
      row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.line};border-radius:12px;">
      <tr><td align="center" style="padding:22px 16px;font-family:${FONT};">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${C.muted};">YOUR INVITE CODE</div>
        <div style="font-family:${MONO};font-size:26px;line-height:36px;font-weight:700;letter-spacing:2px;white-space:nowrap;color:${C.ink};padding-top:8px;">${esc(code.code)}</div>
        <div style="font-size:12px;color:${C.muted};padding-top:6px;">Works once &middot; expires ${esc(dateLabel(code.expires))}</div>
      </td></tr>
    </table>`),
      button(inviteLink(code.code), 'Set up my login', 'Your code is filled in for you when you tap the button.'),
      steps('HOW TO SIGN IN', [
        ['Tap "Set up my login"', `Or go to <a href="${SITE}/clients" style="color:${C.blue};">linocondigital.com/clients</a> and tap "I have an invite code".`],
        ['Choose your password', 'Enter your email and choose a password of at least 10 characters.'],
        ["You're in", 'Next time, sign in at the same page with your email and password.'],
      ]),
      checks('ON YOUR PAGE YOU CAN', [
        'Tell us what you need, with a few taps',
        'Follow every step of your project as it happens',
        'Review your package and proposal, and ask for changes',
        'Sign your service agreement online',
      ]),
      signOff(),
    ],
    footer: `This code is private to ${business}. If you weren't expecting it, you can ignore this email.`,
  })
}
