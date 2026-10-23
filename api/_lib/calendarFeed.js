// The schedule as a calendar feed (.ics) Lino adds to their phone's calendar,
// so reminders come without opening the site. The link carries a long secret
// key instead of a sign-in, because calendar apps can't sign in; Lino can
// make a new link from /admin, which stops the old one.
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { listClients, redis } from './store.js'
import { firstPaidByClient } from './paid.js'
import { addDays, clientSchedule } from './schedule.js'

const KEY = 'admin:calendar:key'

export async function calendarKey(renew) {
  let key = renew ? null : await redis(['GET', KEY])
  if (!key) {
    key = randomBytes(24).toString('base64url')
    await redis(['SET', KEY, key])
  }
  return key
}

async function keyMatches(given) {
  const key = await redis(['GET', KEY])
  if (!key || typeof given !== 'string' || given.length !== key.length) return false
  return timingSafeEqual(Buffer.from(given), Buffer.from(key))
}

const TITLE = {
  start: (name) => `Start work: ${name}`,
  work: (name, item) => `Monthly work due: ${name} (month ${item.n})`,
  invoice: (name, item) => `Send invoice: ${name} (month ${item.n})`,
}

// iCalendar text: commas, semicolons and backslashes escaped, lines folded at 75.
const esc = (text) => String(text).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
const fold = (line) => line.match(/.{1,74}/g).join('\r\n ')
const compact = (day) => day.replaceAll('-', '')

export async function calendarFeed(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  if (!(await keyMatches(req.query?.key))) {
    res.status(404).send('Not found')
    return
  }
  const [clients, paid] = await Promise.all([listClients(), firstPaidByClient()])
  const today = new Date().toISOString().slice(0, 10)
  const from = addDays(today, -60)
  const until = addDays(today, 180)
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LinoCon Digital//Schedule//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:LinoCon schedule', 'X-WR-TIMEZONE:America/Vancouver']
  for (const client of clients) {
    const name = client.details?.name || 'Client'
    for (const item of clientSchedule(client, paid[client.id], until).items) {
      if (item.date < from) continue
      const where = item.kind === 'invoice' ? 'https://linocondigital.com/finance/invoices' : `https://linocondigital.com/admin/${client.id}`
      lines.push(
        'BEGIN:VEVENT',
        `UID:${client.id}-${item.kind}-${item.month}@linocondigital.com`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compact(item.date)}`,
        `DTEND;VALUE=DATE:${compact(addDays(item.date, 1))}`,
        `SUMMARY:${esc(TITLE[item.kind](name, item))}`,
        `DESCRIPTION:${esc(`${client.fileNo ? `File ${client.fileNo}. ` : ''}Open: ${where}`)}`,
        `URL:${where}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(TITLE[item.kind](name, item))}`,
        'TRIGGER:PT9H',
        'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  lines.push('END:VCALENDAR')
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.status(200).send(lines.map(fold).join('\r\n') + '\r\n')
}
