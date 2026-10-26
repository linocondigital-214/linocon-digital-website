// Form submissions are emailed through Web3Forms to linocondigital@gmail.com.
// Visitors see CONTACT_EMAIL (Zoho, forwards into the Gmail). GMAIL_ACCOUNT is
// the Google account: businesses add it as a manager, e-Transfers go to it,
// and Gmail compose links open in it.
// The access key is public by design (Web3Forms keys are meant for client-side
// code). If a send fails, forms fall back to opening the visitor's email app.
export const WEB3FORMS_ACCESS_KEY = 'a4cac5a0-c340-475d-b1a5-6c0fdc7dd992'
export const CONTACT_EMAIL = 'office@linocondigital.com'
export const GMAIL_ACCOUNT = 'linocondigital@gmail.com'

const formsConfigured = !WEB3FORMS_ACCESS_KEY.startsWith('YOUR_')

// Returns true when the lead was delivered, false when it wasn't (or forms
// aren't configured yet) so the caller can fall back.
export async function sendLead(subject, fields) {
  if (!formsConfigured) return false
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, subject, ...fields }),
    })
    const result = await res.json()
    return Boolean(result.success)
  } catch {
    return false
  }
}

export function mailtoLink(subject, fields) {
  const body = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Emails Lino when a client does something on their client page (sets up
// their login, sends their answers, accepts, signs...). Best effort: what the
// client did is saved either way and shows in /admin.
export const notifyLino = (client, what) =>
  sendLead(`Client update: ${client.details.name} ${what}`, {
    Client: client.details.name,
    Update: what,
    Open: `https://linocondigital.com/admin/${client.id}`,
  })
