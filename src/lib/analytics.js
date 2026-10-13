// Lead tracking for Google Analytics 4 (the gtag snippet lives in index.html).
// Page views are counted by GA4 itself, including page changes inside the
// site. This file adds the events that matter for leads:
//   generate_lead      a form was sent (form_name: free_audit | strategy_call)
//   call_booked        a time was booked in the Cal.com calendar on /book
//   book_call_click    a "Book a call" button was clicked
//   audit_click        a "Free audit" button was clicked
//   email_click        an email link was clicked
//   phone_click        a phone link was clicked
// Never pass names, emails, phone numbers or message text here: Google's
// rules forbid personal data in Analytics.

export function track(event, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', event, params)
}

// Where on the page a click happened, e.g. "top_menu", "footer", "hero".
function clickLocation(el) {
  if (el.closest('footer')) return 'footer'
  const header = el.closest('header')
  if (header && !header.closest('main')) return 'top_menu'
  const section = el.closest('section[id]')
  if (section) return section.id === 'top' ? 'hero' : section.id
  return 'page'
}

function linkEvent(href) {
  if (!href) return null
  if (href.startsWith('mailto:')) return 'email_click'
  if (href.startsWith('tel:')) return 'phone_click'
  const path = href.replace(/^https?:\/\/[^/]+/, '')
  if (path === '/book' || path.startsWith('/book?') || path.startsWith('/book#')) return 'book_call_click'
  if (path === '#audit' || path === '/#audit') return 'audit_click'
  return null
}

// One listener for the whole site, so every current and future button or
// link to /book, #audit, mailto: or tel: is counted without extra code.
function handleClick(e) {
  const link = e.target.closest?.('a[href]')
  if (!link) return
  const event = linkEvent(link.getAttribute('href'))
  if (!event) return
  track(event, {
    // innerText skips the hidden half of buttons with phone/desktop labels.
    link_text: (link.innerText || link.textContent).trim().replace(/\s+/g, ' ').slice(0, 100),
    link_location: clickLocation(link),
  })
}

// The Cal.com calendar on /book tells the page when a booking is made.
// Only the fact that a booking happened is sent, never the attendee details.
let lastBookingAt = 0
function handleMessage(e) {
  let host
  try {
    host = new URL(e.origin).hostname
  } catch {
    return
  }
  if (host !== 'cal.com' && !host.endsWith('.cal.com')) return
  const msg = e.data
  if (!msg || msg.originator !== 'CAL') return
  if (msg.type !== 'bookingSuccessfulV2' && msg.type !== 'bookingSuccessful') return
  // Cal.com sends both the old and new message for one booking.
  if (Date.now() - lastBookingAt < 5000) return
  lastBookingAt = Date.now()
  track('call_booked', { booking_tool: 'cal.com' })
}

let started = false
export function startLeadTracking() {
  if (started) return
  started = true
  document.addEventListener('click', handleClick, true)
  window.addEventListener('message', handleMessage)
}
