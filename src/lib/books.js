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

export const BOOKS_PLANS = [
  {
    name: 'Books Starter',
    price: '$49.99',
    unit: '/ month for 12 months',
    note: 'Then it’s yours. Optional Care plan $24.99 / month.',
    points: ['Dashboard: money in, money out, profit', 'Expenses with receipt photos', 'GST report for each filing period', 'Export for your accountant'],
  },
  {
    name: 'Books Business',
    price: '$79.99',
    unit: '/ month for 12 months',
    note: 'Then it’s yours. Optional Care plan $29.99 / month.',
    points: ['Everything in Starter', 'Branded invoices with GST and a Pay now button', 'Stripe payments matched automatically', 'Year-end summary and a bookkeeper login'],
    featured: true,
  },
]
