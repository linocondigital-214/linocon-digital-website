import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CONTACT_EMAIL } from '../lib/leads'

// A plain mailto: link does nothing on computers without an email app set up
// (most people there use Gmail or Outlook in the browser), so every visible
// email link opens a small menu instead: Gmail, Outlook, the email app, or
// copy the address. Spans only, so it can sit inside a paragraph.
const enc = encodeURIComponent

const item =
  'flex items-center w-full h-9 px-3 rounded-lg text-left text-[13px] font-semibold text-text! no-underline! hover:bg-white/10 transition-colors'

export default function EmailUs({ children = 'Email us', subject = '', className, wrapperClassName = 'relative inline-block' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shift, setShift] = useState(0)
  const ref = useRef(null)
  const menu = useRef(null)

  // Keep the menu on screen when the link sits near the edge of a phone.
  useLayoutEffect(() => {
    if (!open) return setShift(0)
    const r = menu.current.getBoundingClientRect()
    const room = document.documentElement.clientWidth - 8
    setShift(r.left < 8 ? 8 - r.left : r.right > room ? room - r.right : 0)
  }, [open])

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

  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(CONTACT_EMAIL)}${subject ? `&su=${enc(subject)}` : ''}`
  const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(CONTACT_EMAIL)}${subject ? `&subject=${enc(subject)}` : ''}`
  const mailto = `mailto:${CONTACT_EMAIL}${subject ? `?subject=${enc(subject)}` : ''}`

  return (
    <span ref={ref} className={wrapperClassName}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={className}>
        {children}
      </button>
      {open && (
        <span
          ref={menu}
          style={{ marginLeft: shift }}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 block w-64 p-2 rounded-2xl border border-white/15 bg-ink shadow-xl text-left whitespace-normal"
        >
          <span className="block px-3 pt-1 pb-2 text-[13px] font-normal text-text-secondary break-all">{CONTACT_EMAIL}</span>
          <a href={gmail} target="_blank" rel="noreferrer" data-track="email_click" className={item}>
            Open in Gmail
          </a>
          <a href={outlook} target="_blank" rel="noreferrer" data-track="email_click" className={item}>
            Open in Outlook
          </a>
          <a href={mailto} className={item}>
            Use my email app
          </a>
          <button type="button" onClick={copy} className={item}>
            {copied ? 'Copied!' : 'Copy email address'}
          </button>
        </span>
      )}
    </span>
  )
}
