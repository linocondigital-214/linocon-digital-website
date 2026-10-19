// Expenses: the categories (same list as the Financial Log sheet, roughly the
// CRA T2125 lines), the automatic category guess, and checking what the
// page sends before it's saved.

export const CATEGORIES = [
  'Advertising & marketing',
  'Software & subscriptions',
  'Website hosting & domains',
  'Phone & internet',
  'Office supplies',
  'Computer & equipment',
  'Professional fees (accountant, lawyer)',
  'Bank & payment fees',
  'Licences, memberships & dues',
  'Training & courses',
  'Contractors & freelancers',
  'Insurance',
  'Meals & entertainment (50%)',
  'Vehicle & travel',
  'Home office',
  'Other',
]

export const PAID_WITH = ['Business bank / debit', 'Credit card', 'Interac e-Transfer', 'Cash', 'Personal money', 'Other']

// Words in a vendor name that point to a category. The first match wins, so
// more specific words come first.
const KEYWORDS = [
  ['Bank & payment fees', ['stripe fee', 'stripe', 'square fee', 'paypal fee', 'bank fee', 'service charge', 'interac fee', 'nsf']],
  ['Website hosting & domains', ['vercel', 'netlify', 'godaddy', 'namecheap', 'cloudflare', 'hostinger', 'bluehost', 'siteground', 'squarespace domains', 'domain', 'hosting', 'upstash', 'web3forms']],
  ['Advertising & marketing', ['google ads', 'facebook ads', 'meta ads', 'meta platforms', 'tiktok ads', 'instagram', 'linkedin ads', 'yelp', 'canva', 'mailerlite', 'mailchimp', 'buffer', 'vistaprint', 'print', 'flyer', 'business cards', 'ads']],
  ['Software & subscriptions', ['adobe', 'microsoft', 'google workspace', 'google one', 'github', 'openai', 'anthropic', 'claude', 'notion', 'zoom', 'dropbox', 'slack', 'figma', 'cal.com', 'calendly', 'apple.com', 'icloud', 'semrush', 'ahrefs', 'subscription', 'software']],
  ['Phone & internet', ['telus', 'rogers', 'bell', 'shaw', 'fido', 'koodo', 'freedom mobile', 'virgin plus', 'public mobile', 'chatr', 'lucky mobile', 'novus', 'internet', 'mobile']],
  ['Computer & equipment', ['best buy', 'apple store', 'memory express', 'canada computers', 'dell', 'lenovo', 'logitech', 'laptop', 'monitor']],
  ['Office supplies', ['staples', 'office depot', 'dollarama', 'london drugs', 'paper', 'ink', 'stationery', 'amazon']],
  ['Professional fees (accountant, lawyer)', ['cpa', 'accounting', 'accountant', 'bookkeep', 'law', 'lawyer', 'legal', 'notary']],
  ['Licences, memberships & dues', ['licence', 'license', 'bc registries', 'registry', 'chamber of commerce', 'membership', 'bbb', 'dues']],
  ['Training & courses', ['udemy', 'coursera', 'skillshare', 'linkedin learning', 'course', 'training', 'workshop', 'conference', 'webinar']],
  ['Contractors & freelancers', ['upwork', 'fiverr', 'freelance', 'contractor']],
  ['Insurance', ['insurance', 'icbc', 'intact', 'aviva', 'zensurance', 'apollo']],
  ['Vehicle & travel', ['shell', 'esso', 'petro-canada', 'petro canada', 'chevron', 'husky', 'mobil', 'gas', 'parking', 'impark', 'easypark', 'paybyphone', 'compass', 'translink', 'uber', 'lyft', 'evo', 'modo', 'bc ferries', 'westjet', 'air canada', 'flair', 'hotel', 'airbnb']],
  ['Meals & entertainment (50%)', ['starbucks', 'tim hortons', 'tims', 'cafe', 'coffee', 'restaurant', 'pub', 'grill', 'sushi', 'pizza', 'mcdonald', 'subway', 'a&w', 'white spot', 'earls', 'cactus club', 'doordash', 'skip the dishes', 'ubereats', 'uber eats', 'lunch', 'dinner']],
  ['Home office', ['bc hydro', 'fortisbc', 'rent', 'hydro', 'utilities']],
]

export const vendorKey = (vendor) =>
  String(vendor ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9&.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Lino's own past choice for this vendor wins; otherwise a guess from the
// name; otherwise null (the page then leaves the choice to Lino).
export function suggestCategory(vendor, learned = {}) {
  const key = vendorKey(vendor)
  if (!key) return null
  if (learned[key] && CATEGORIES.includes(learned[key])) return { category: learned[key], from: 'learned' }
  const padded = ` ${key} `
  for (const [category, words] of KEYWORDS) {
    if (words.some((w) => padded.includes(` ${w}`))) return { category, from: 'guess' }
  }
  return null
}

export class Invalid extends Error {}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const cents = (v) => (Number.isInteger(v) && v >= 0 && v <= 100_000_000 ? v : null)

// Checks an expense from the page. Amounts arrive as whole cents.
export function cleanExpense(input = {}) {
  const date = text(input.date, 10)
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) throw new Invalid('Pick the date you paid.')
  const vendor = text(input.vendor, 80)
  if (!vendor) throw new Invalid('Type who you paid.')
  const amount = cents(input.amount)
  if (!amount) throw new Invalid('Type the amount you paid.')
  const gst = input.gst === null || input.gst === undefined || input.gst === '' ? 0 : cents(input.gst)
  if (gst === null || gst > amount) throw new Invalid('The GST/HST part can’t be more than the total.')
  const category = CATEGORIES.includes(input.category) ? input.category : null
  if (!category) throw new Invalid('Pick a category.')
  const paidWith = PAID_WITH.includes(input.paidWith) ? input.paidWith : PAID_WITH[0]
  return { date, vendor, amount, gst, category, paidWith, note: text(input.note, 300) }
}

// A receipt photo: a JPEG or PNG data URL, already shrunk on the device.
export const MAX_RECEIPT = 1_200_000

export function checkReceipt(dataUrl) {
  if (typeof dataUrl !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) {
    throw new Invalid('That photo couldn’t be read. Try another one.')
  }
  if (dataUrl.length > MAX_RECEIPT) throw new Invalid('That photo is too large. Try taking it again.')
  return dataUrl
}
