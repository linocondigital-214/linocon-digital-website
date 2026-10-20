// LinoCon Books: the client's own bookkeeping app. Coming soon, so the site
// only collects a waitlist; there is no Pay button for it yet. When it
// launches, set COMING_SOON to false and add the Stripe links.
// Founding prices are Lino's (CAD), from the bundle case study in the
// project's finance/service-proposal folder.
export const BOOKS = {
  name: 'LinoCon Books',
  path: '/books',
  menu: 'Coming soon: your own bookkeeping app.',
  comingSoon: true,
}

// LinoCon Books as the 4th block of the homepage "What we do" section. Same
// shape as a SERVICES entry, plus href/cta so its button goes to the waitlist
// instead of a /services page.
export const BOOKS_SERVICE = {
  slug: 'books',
  name: BOOKS.name,
  kicker: '04 — LinoCon Books',
  comingSoon: true,
  title: 'Your own bookkeeping app, on your own domain.',
  body: 'A simple app for your invoices, expenses and sales tax (GST/HST). Pay for 12 months, then it’s yours to keep.',
  points: ['Invoices your customers can pay online', 'Expenses with receipt photos', 'GST/HST report ready for your accountant'],
  image: 'books',
  alt: 'A small business bookkeeping app showing money in, money out, a paid invoice and a GST/HST report',
  href: BOOKS.path,
  cta: 'Join the waitlist',
}

export const BOOKS_PLANS = [
  {
    name: 'Books Starter',
    price: '$49.99',
    unit: '/ month for 12 months',
    note: 'Then it’s yours. Optional Care plan $24.99 / month.',
    points: ['Dashboard: money in, money out, profit', 'Expenses with receipt photos', 'GST/HST report for each filing period', 'Export for your accountant'],
  },
  {
    name: 'Books Business',
    price: '$79.99',
    unit: '/ month for 12 months',
    note: 'Then it’s yours. Optional Care plan $29.99 / month.',
    points: ['Everything in Starter', 'Branded invoices with GST/HST and a Pay now button', 'Stripe payments matched automatically', 'Year-end summary and a bookkeeper login'],
    featured: true,
  },
]
