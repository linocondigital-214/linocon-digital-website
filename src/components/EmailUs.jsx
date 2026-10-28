import { useEffect, useRef, useState } from 'react'
import { CONTACT_EMAIL } from '../lib/leads'

// A plain mailto: link does nothing on computers without an email app set up
// (most people there use Gmail or Outlook in the browser), so "Email us" opens
// a small menu: Gmail, Outlook, the email app, or copy the address.
const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`
const OUTLOOK = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(CONTACT_EMAIL)}`

const item =
  'flex items-center w-full h-9 px-3 rounded-lg text-left text-[13px] font-semibold text-text hover:bg-white/10 transition-colors'

export default function EmailUs({ className, label = 'Email us' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function copy() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy our email address:', CONTACT_EMAIL)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={className}>
        {label}
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 w-64 p-2 rounded-2xl border border-white/15 bg-ink shadow-xl">
          <p className="px-3 pt-1 pb-2 text-[13px] text-text-secondary break-all">{CONTACT_EMAIL}</p>
          <a href={GMAIL} target="_blank" rel="noreferrer" data-track="email_click" className={item}>
            Open in Gmail
          </a>
          <a href={OUTLOOK} target="_blank" rel="noreferrer" data-track="email_click" className={item}>
            Open in Outlook
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className={item}>
            Use my email app
          </a>
          <button type="button" onClick={copy} className={item}>
            {copied ? 'Copied!' : 'Copy email address'}
          </button>
        </div>
      )}
    </div>
  )
}
