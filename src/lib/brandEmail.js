// The LinoCon Digital look for emails Lino sends from admin (the welcome
// email, the package). Email-safe HTML: tables and inline styles, which Gmail
// and Outlook keep when the email is pasted into a new message.

export const SITE = 'https://linocondigital.com'
const LOGO = `${SITE}/email/linocon-logo-light.png`
export const C = {
  ink: '#0b0b10',
  blue: '#2e6bff',
  orange: '#ff6a3d',
  green: '#16a34a',
  text: '#1b1b22',
  muted: '#5f6270',
  line: '#e6e6ea',
  soft: '#f6f7fb',
}
export const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
export const MONO = "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace"

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const firstName = (client) => client.details.contact?.trim().split(/\s+/)[0] || ''

const todayLabel = (date = new Date()) => date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })

// One block of the email body, with the page's side padding.
export const row = (html, pad = '22px 32px 6px 32px') => `<tr><td style="padding:${pad};font-family:${FONT};">${html}</td></tr>`

export const label = (text) => `<div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:2px;color:${C.muted};padding-bottom:12px;">${text}</div>`

export const heading = (title, intro) =>
  row(
    `<div style="font-size:26px;line-height:32px;font-weight:800;color:${C.text};">${title}</div>
    <div style="font-size:15px;line-height:23px;color:${C.muted};padding-top:10px;">${intro}</div>`,
    '34px 32px 8px 32px',
  )

export const button = (href, text, note) =>
  `<tr><td align="center" style="padding:22px 32px 6px 32px;">
    <a href="${href}" style="display:inline-block;background:${C.blue};background-image:linear-gradient(120deg, ${C.blue}, ${C.orange});color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;text-decoration:none;padding:15px 34px;border-radius:999px;">${text} &rarr;</a>
    ${note ? `<div style="font-family:${FONT};font-size:12px;color:${C.muted};padding-top:10px;">${note}</div>` : ''}
  </td></tr>`

export const steps = (title, list) =>
  row(
    `${label(title)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${list
      .map(
        ([head, text], i) => `<tr>
  <td valign="top" width="44" style="padding:0 0 18px 0;">
    <div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:${C.blue};color:#ffffff;font-family:${FONT};font-size:14px;font-weight:700;text-align:center;">${i + 1}</div>
  </td>
  <td valign="top" style="padding:3px 0 18px 0;font-family:${FONT};">
    <div style="font-size:15px;font-weight:700;color:${C.text};">${head}</div>
    <div style="font-size:14px;line-height:21px;color:${C.muted};padding-top:2px;">${text}</div>
  </td>
</tr>`,
      )
      .join('')}</table>`,
    '28px 32px 4px 32px',
  )

export const checks = (title, list) =>
  row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">
      <tr><td style="padding-top:22px;">${label(title)}</td></tr>
      <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${list
        .map(
          (text) => `<tr>
  <td valign="top" width="22" style="padding:0 0 8px 0;font-family:${FONT};font-size:14px;color:${C.orange};font-weight:700;">&#10003;</td>
  <td style="padding:0 0 8px 0;font-family:${FONT};font-size:14px;line-height:21px;color:${C.text};">${text}</td>
</tr>`,
        )
        .join('')}</table></td></tr>
    </table>`,
    '6px 32px 8px 32px',
  )

export const signOff = () =>
  row(
    `<div style="font-size:15px;line-height:23px;color:${C.text};">Questions? Just reply to this email.</div>
    <div style="font-size:15px;line-height:22px;color:${C.text};padding-top:16px;font-weight:700;">Lino</div>
    <div style="font-size:14px;line-height:20px;color:${C.muted};">LinoCon Digital &middot; Vancouver, BC</div>`,
    '22px 32px 30px 32px',
  )

// The whole email: dark header with the logo and a badge, the gradient
// line, the body rows, and the dark footer.
export function emailShell({ badge, rows, footer, date = new Date() }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f2f4;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${C.line};">

  <tr><td style="background:${C.ink};padding:26px 32px 22px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle"><img src="${LOGO}" width="210" height="31" alt="LinoCon Digital" style="display:block;border:0;width:210px;height:31px;"></td>
      <td valign="middle" align="right" style="font-family:${FONT};">
        <span style="display:inline-block;padding:5px 12px;border-radius:999px;border:1px solid ${C.orange};color:${C.orange};font-size:11px;font-weight:700;letter-spacing:1.5px;white-space:nowrap;">${badge}</span>
        <div style="color:#9a9caa;font-size:12px;padding-top:6px;">${todayLabel(date)}</div>
      </td>
    </tr></table>
    <div style="font-family:${FONT};color:#9a9caa;font-size:12px;letter-spacing:1.5px;padding-top:14px;">GET FOUND. GET CHOSEN. GET GROWING.</div>
  </td></tr>
  <tr><td height="4" style="height:4px;line-height:4px;font-size:0;background:${C.blue};background-image:linear-gradient(90deg, ${C.blue}, ${C.orange});">&nbsp;</td></tr>
${rows.join('\n')}
  <tr><td style="background:${C.ink};padding:18px 32px;font-family:${FONT};font-size:12px;line-height:18px;color:#9a9caa;">
    <a href="${SITE}" style="color:#ffffff;text-decoration:none;font-weight:700;">linocondigital.com</a> &middot; <a href="mailto:office@linocondigital.com" style="color:#9a9caa;text-decoration:none;">office@linocondigital.com</a>${footer ? `<br>${footer}` : ''}
  </td></tr>

</table>
</td></tr>
</table>`
}

// Puts a designed email on the clipboard (with a plain text copy), so it
// pastes into Gmail with its look. Falls back to selecting `node` (a
// rendered preview) and copying that, which keeps the look too.
export async function copyEmail(html, text, node) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) }),
    ])
    return true
  } catch {
    if (!node) return false
    const range = document.createRange()
    range.selectNodeContents(node)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    const ok = document.execCommand('copy')
    selection.removeAllRanges()
    return ok
  }
}
