// Lead tracking for Google Analytics 4 (the gtag snippet lives in index.html).
// Page views are counted by GA4 itself, including page changes inside the
// site. This file adds the events that matter for leads:
//   generate_lead      a form was sent (form_name: free_audit | strategy_call | books_waitlist)
//   call_booked        a time was booked in the Cal.com calendar on /book
//   book_call_click    a "Book a call" button was clicked
//   audit_click        a "Free audit" button was clicked
//   email_click        an email link was clicked
//   phone_click        a phone link was clicked
//   save_contact_click "Save contact" was tapped on the /card business card
//   card_share_click   "Share this card" was tapped on /card
//   begin_checkout     a Stripe payment link was clicked (Grow Plan on /pay,
//                      Pay now on a client's progress page)
//   review_click       the "Leave us a Google review" link was clicked
//   page_not_found     someone reached an address the site doesn't have
//                      (page_path says which, to find broken links)
//
// Analytics only runs on linocondigital.com (not on vercel.app previews), and
// never on /admin or /finance. Browsers that have opened /admin or /finance
// (Lino's own) send traffic_type=internal, so GA4's "Internal Traffic" data
// filter can leave Lino's own visits out of the reports.
// Never pass names, emails, phone numbers or message text here: Google's
// rules forbid personal data in Analytics.

export const GA_ID = 'G-HS2MYMBVX9'
const INTERNAL_KEY = 'linocon_internal'

// Marks this browser as Lino's own (see index.html, which reads it on load).
export function markInternalVisitor() {
  try {
    if (localStorage.getItem(INTERNAL_KEY) === '1') return
    localStorage.setItem(INTERNAL_KEY, '1')
  } catch {
    return
  }
  if (typeof window.gtag === 'function') window.gtag('set', { traffic_type: 'internal' })
}

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
  if (/^https:\/\/(buy|checkout|invoice)\.stripe\.com\//.test(href)) return 'begin_checkout'
  if (/^https:\/\/g\.page\/r\/[^/]+\/review/.test(href)) return 'review_click'
  const path = href.replace(/^https?:\/\/[^/]+/, '')
  if (path === '/book' || path.startsWith('/book?') || path.startsWith('/book#')) return 'book_call_click'
  if (path === '#audit' || path === '/#audit') return 'audit_click'
  return null
}

// One listener for the whole site, so every current and future button or
// link to /book, #audit, mailto:, tel: or a Stripe payment page is counted without extra code.
function handleClick(e) {
  const link = e.target.closest?.('a[href]')
  if (!link) return
  const event = link.dataset.track || linkEvent(link.getAttribute('href'))
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
