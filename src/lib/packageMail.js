// The designed email that sends a client their package (see
// src/lib/brandEmail.js for the look). The plain text twin is packageEmail()
// in src/lib/packages.js.
import { C, FONT, SITE, button, emailShell, esc, firstName, heading, label, row, signOff, steps } from './brandEmail'
import { calcPackage, money } from './packages'

export const packageSubject = (client) => `Your LinoCon Digital package: ${client.details.name}`

// One table of lines (one-time or monthly) with its total.
function priceTable(title, lines, total, per, gst) {
  const line = (l) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;line-height:20px;color:${C.text};">
    ${esc(l.label)}${l.detail ? `<div style="font-size:12px;color:${C.muted};">${esc(l.detail)}</div>` : ''}
  </td>
  <td align="right" valign="top" style="padding:10px 0 10px 12px;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;white-space:nowrap;color:${l.cents < 0 ? C.green : C.text};font-weight:${l.cents < 0 ? 700 : 400};">
    ${money(l.cents)}${per}
  </td>
</tr>`
  return row(`${label(title)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${lines.map(line).join('')}
      <tr>
        <td style="padding:12px 0 0 0;font-family:${FONT};font-size:15px;font-weight:800;color:${C.text};">Total</td>
        <td align="right" style="padding:12px 0 0 12px;font-family:${FONT};font-size:17px;font-weight:800;color:${C.text};white-space:nowrap;">${money(total)}${per}${gst ? `<div style="font-size:12px;font-weight:400;color:${C.muted};">+ GST</div>` : ''}</td>
      </tr>
    </table>`)
}

// The headline numbers, like the summary in admin.
function totals(calc) {
  const cells = [
    calc.onceTotal > 0 && ['ONE-TIME', money(calc.onceTotal + calc.onceGst), calc.gst ? 'incl. GST' : ''],
    calc.hasMonthly && ['EACH MONTH', money(calc.monthTotal + calc.monthGst), calc.gst ? 'incl. GST' : ''],
    calc.onceTotal > 0 && calc.depositPct !== '0' && ['TO START', money(calc.deposit + calc.depositGst), `${calc.depositPct}% deposit`],
  ].filter(Boolean)
  const width = Math.floor(100 / cells.length)
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ink};border-radius:12px;">
      <tr>${cells
        .map(
          ([name, value, note], i) => `<td width="${width}%" valign="top" style="padding:18px 16px;font-family:${FONT};${i ? 'border-left:1px solid #26262e;' : ''}">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#9a9caa;">${name}</div>
        <div style="font-size:22px;line-height:30px;font-weight:800;color:${i === cells.length - 1 ? C.orange : '#ffffff'};padding-top:4px;white-space:nowrap;">${value}</div>
        <div style="font-size:12px;color:#9a9caa;">${note}</div>
      </td>`,
        )
        .join('')}</tr>
    </table>`,
  )
}

export function packageHtml(client, pkg) {
  const calc = calcPackage(pkg)
  const first = esc(firstName(client))
  const business = esc(client.details.name)
  const note = pkg.opt?.note?.trim()
  const rows = [
    heading(
      `Your package${first ? `, ${first}` : ''}.`,
      `Here is the package we put together for <b style="color:${C.text};">${business}</b>${business.endsWith('.') ? '' : '.'} Everything is below.`,
    ),
    totals(calc),
    note &&
      row(
        `<div style="border-left:3px solid ${C.blue};background:${C.soft};padding:14px 16px;font-size:14px;line-height:21px;color:${C.text};white-space:pre-wrap;">${esc(note)}</div>`,
      ),
    calc.once.length && priceTable('ONE-TIME', calc.once, calc.onceTotal, '', calc.gst),
    calc.month.length && priceTable('EACH MONTH', calc.month, calc.monthTotal, ' / month', calc.gst),
    client.joined && button(`${SITE}/clients/package`, 'View my package', 'Sign in to your client page to accept it or ask for changes.'),
    steps("WHAT'S NEXT", [
      ['Look it over', client.joined ? 'Read it below or on your client page, where you can also save it as a PDF.' : 'Read it below, and reply with any questions.'],
      ['Accept or ask for changes', client.joined ? 'Do it on your client page, or just reply to this email.' : 'Just reply to this email.'],
      ['Sign the service agreement', "Once you're happy, we send the agreement to sign online, and work starts after the deposit."],
    ]),
    signOff(),
  ].filter(Boolean)
  return emailShell({ badge: 'YOUR PACKAGE', rows, footer: `Prepared for ${business}${business.endsWith('.') ? '' : '.'} Prices in Canadian dollars.` })
}
