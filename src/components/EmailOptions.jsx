import { useState } from 'react'
import { GMAIL_ACCOUNT } from '../lib/leads'

// Ways to send an email Lino wrote here. A mailto: link only works where an
// email app is set up, which most phones have but many computers don't (Gmail
// in the browser), so Gmail opens in a new tab with the email filled in, and
// the text can be copied into anything else.
export function gmailLink(to, subject, body) {
  const params = { authuser: GMAIL_ACCOUNT, view: 'cm', fs: '1', to: to || '', su: subject, body }
  return `https://mail.google.com/mail/?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`
}

export const mailtoHref = (to, subject, body) =>
  `mailto:${encodeURIComponent(to || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export default function EmailOptions({ to, subject, body, label = 'Email it', primary, secondary }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    const text = `${to ? `To: ${to}\n` : ''}Subject: ${subject}\n\n${body}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the email:', text)
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={gmailLink(to, subject, body)} target="_blank" rel="noreferrer" className={primary}>
        {label} with Gmail
      </a>
      <a href={mailtoHref(to, subject, body)} className={secondary}>
        Email app
      </a>
      <button type="button" onClick={copy} className={secondary}>
        {copied ? 'Copied' : 'Copy email'}
      </button>
    </div>
  )
}
