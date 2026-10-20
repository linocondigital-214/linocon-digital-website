// Picks the store, date, total and GST/HST out of a receipt's text (from a
// PDF's own text, or read off a photo on the device). It only guesses: the
// form shows what it found and Lino checks it before saving. Anything it
// isn't sure of is left out, so the field stays blank.

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// Amounts like 1,234.56 or $ 12.34 (photos often read "," or a space for ".").
const AMOUNT = /(?:^|[^\d.])(-?)\$?\s?(\d{1,3}(?:,\d{3})+|\d{1,6})\s?[.,]\s?(\d{2})(?![\d%])/g

function amountsIn(line) {
  const found = []
  for (const m of line.matchAll(AMOUNT)) {
    if (m[1]) continue // a negative amount is a discount or change
    found.push(Number(m[2].replace(/,/g, '')) * 100 + Number(m[3]))
  }
  return found
}

const TOTAL = /\b(grand\s*total|total\s*(due|paid|amount|charged|cad|\(cad\))?|amount\s*(due|paid|charged)|balance\s*due|you\s*paid|order\s*total|montant\s*total|total\s*:)/i
const NOT_TOTAL = /\b(sub\s*-?\s*total|total\s*(savings|saved|discount|items?|qty|quantity|tax(es)?|before\s*tax|excl)|tax\s*total|points|tip\b)/i
const GST = /\b(g\s?\.?\s?s\s?\.?\s?t|h\s?\.?\s?s\s?\.?\s?t|tps|gst\s*\/\s*hst)\b/i
// A GST line that's really the store's registration number.
const GST_NUMBER = /\b(reg|registration|no\.?|number|#)\b|#|\bRT\s?\d{4}/i

function findTotal(lines) {
  const picks = []
  lines.forEach((line, i) => {
    if (!TOTAL.test(line) || NOT_TOTAL.test(line)) return
    // The amount is on the same line, or on the next one in a two-column PDF.
    const here = amountsIn(line)
    const amounts = here.length ? here : amountsIn(lines[i + 1] ?? '')
    if (amounts.length) picks.push(amounts[amounts.length - 1])
  })
  if (picks.length) return Math.max(...picks)
  return null
}

function findGst(lines, total) {
  const picks = []
  const noRate = (line) => amountsIn(line.replace(/\d+(\.\d+)?\s?%/g, ' '))
  lines.forEach((line, i) => {
    if (!GST.test(line) || GST_NUMBER.test(line)) return
    // "GST 5% 0.62": the last amount is the tax. Or on the next line in a PDF.
    const here = noRate(line)
    const amounts = here.length ? here : noRate(lines[i + 1] ?? '')
    if (amounts.length) picks.push(amounts[amounts.length - 1])
  })
  const gst = picks.length ? Math.max(...picks) : null
  // GST/HST is at most 15% of the total (HST in the Atlantic provinces).
  return gst && total && gst <= Math.ceil(total * 0.16) ? gst : null
}

const pad = (n) => String(n).padStart(2, '0')

function makeDate(y, m, d, today) {
  if (y < 100) y += 2000
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const iso = `${y}-${pad(m)}-${pad(d)}`
  const t = new Date(`${iso}T12:00:00Z`)
  if (Number.isNaN(t.getTime()) || t.getUTCDate() !== d) return null
  // A receipt is from the past, and not long ago.
  if (iso > today || Number(today.slice(0, 4)) - y > 2) return null
  return iso
}

function findDate(text, today) {
  const tries = []
  // 2026-10-20, 2026/10/20
  for (const m of text.matchAll(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) tries.push([m.index, makeDate(+m[1], +m[2], +m[3], today)])
  // Oct 20, 2026 / October 20 2026 / 20 Oct 2026 / 20-OCT-26
  for (const m of text.matchAll(/\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})\b/gi)) {
    const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase())
    if (month >= 0) tries.push([m.index, makeDate(+m[3], month + 1, +m[2], today)])
  }
  for (const m of text.matchAll(/\b(\d{1,2})[\s-]([a-z]{3,9})\.?[\s-,]+(\d{2,4})\b/gi)) {
    const month = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase())
    if (month >= 0) tries.push([m.index, makeDate(+m[3], month + 1, +m[1], today)])
  }
  // 10/20/2026 or 20/10/2026 or 10/20/26. Whichever reading is a real,
  // recent date wins; when both are, month first (most tills in Canada).
  for (const m of text.matchAll(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})\b/g)) {
    tries.push([m.index, makeDate(+m[3], +m[1], +m[2], today) ?? makeDate(+m[3], +m[2], +m[1], today)])
  }
  const good = tries.filter(([, iso]) => iso).sort((a, b) => a[0] - b[0])
  return good.length ? good[0][1] : null
}

// Store names that show up on receipts, by the words printed on them.
const STORES = [
  ['staples', 'Staples'],
  ['best buy', 'Best Buy'],
  ['london drugs', 'London Drugs'],
  ['canadian tire', 'Canadian Tire'],
  ['home depot', 'Home Depot'],
  ['costco', 'Costco'],
  ['walmart', 'Walmart'],
  ['shoppers drug', 'Shoppers Drug Mart'],
  ['save-on-foods', 'Save-On-Foods'],
  ['save on foods', 'Save-On-Foods'],
  ['superstore', 'Real Canadian Superstore'],
  ['safeway', 'Safeway'],
  ['dollarama', 'Dollarama'],
  ['ikea', 'IKEA'],
  ['memory express', 'Memory Express'],
  ['canada computers', 'Canada Computers'],
  ['starbucks', 'Starbucks'],
  ['tim hortons', 'Tim Hortons'],
  ['mcdonald', 'McDonald’s'],
  ['white spot', 'White Spot'],
  ['cactus club', 'Cactus Club'],
  ['earls', 'Earls'],
  ['petro-canada', 'Petro-Canada'],
  ['petro canada', 'Petro-Canada'],
  ['chevron', 'Chevron'],
  ['esso', 'Esso'],
  ['shell', 'Shell'],
  ['impark', 'Impark'],
  ['easypark', 'EasyPark'],
  ['paybyphone', 'PayByPhone'],
  ['bc ferries', 'BC Ferries'],
  ['uber', 'Uber'],
  ['amazon', 'Amazon'],
  ['google', 'Google'],
  ['microsoft', 'Microsoft'],
  ['adobe', 'Adobe'],
  ['apple', 'Apple'],
  ['canva', 'Canva'],
  ['godaddy', 'GoDaddy'],
  ['namecheap', 'Namecheap'],
  ['vercel', 'Vercel'],
  ['github', 'GitHub'],
  ['anthropic', 'Anthropic'],
  ['openai', 'OpenAI'],
  ['mailerlite', 'MailerLite'],
  ['telus', 'TELUS'],
  ['rogers', 'Rogers'],
  ['fido', 'Fido'],
  ['koodo', 'Koodo'],
  ['shaw', 'Shaw'],
  ['bc hydro', 'BC Hydro'],
  ['fortisbc', 'FortisBC'],
  ['vistaprint', 'Vistaprint'],
  ['udemy', 'Udemy'],
  ['upwork', 'Upwork'],
  ['fiverr', 'Fiverr'],
]

// Lines near the top that are never the store's name.
const NOT_NAME =
  /\b(receipt|invoice|order|welcome|thank|tel|phone|fax|www|http|\.com|\.ca|street|st\.|ave|avenue|road|rd\.|blvd|suite|unit|bc|v\d[a-z]\s?\d|date|time|cashier|server|table|store\s*#|trans|transaction|customer|copy|page|bill\s*to|ship\s*to|paid|total|gst|hst)\b/i

const titleCase = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())

function findVendor(lines) {
  // A known store printed near the top (further down could be an item, like apple juice).
  const top = lines.slice(0, 8).join('\n').toLowerCase()
  for (const [word, name] of STORES) {
    if (new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}([^a-z]|$)`).test(top)) return name
  }
  for (const line of lines.slice(0, 6)) {
    const clean = line.replace(/[^A-Za-z0-9&'’.\- ]+/g, ' ').replace(/\s+/g, ' ').trim()
    const letters = clean.replace(/[^A-Za-z]/g, '').length
    if (!/[A-Za-z]{3,}/.test(clean) || letters < clean.length * 0.5 || NOT_NAME.test(clean)) continue
    // Drop a store number at the end, like "#452".
    const name = line.replace(/\s*(#|no\.?|store)\s*\d+\s*$/i, '').replace(/[^A-Za-z0-9&'’.\- ]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40)
    return name === name.toUpperCase() ? titleCase(name) : name
  }
  return null
}

export function parseReceipt(text, today) {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const amount = findTotal(lines)
  return {
    vendor: findVendor(lines),
    date: findDate(lines.join('\n'), today),
    amount,
    gst: findGst(lines, amount),
  }
}
