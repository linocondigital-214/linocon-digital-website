// The four bundles. The homepage "Bundles" section, the footer and each
// bundle's own page (/bundles/<slug>) all read from this list. Prices are
// Lino's founding-client prices, in CAD (see the project's
// stripe/invoice-wording.md). The full page content lives in bundlePages.js,
// which only loads with the page itself.
export const BUNDLES = [
  {
    slug: 'launch-bundle',
    name: 'Launch Bundle',
    tagline: 'Website Creation + SEO Setup',
    price: '10% off',
    unit: 'both, booked together',
    note: 'Website priced to your project after a free strategy call.',
    points: ['Custom, mobile-first website', 'Enquiry forms and call booking built in', 'Technical and on-page SEO setup', 'Search Console and analytics tracking'],
    menu: 'A new website plus SEO setup, 10% off.',
    metaTitle: 'Launch Bundle: New Website + SEO Setup, 10% Off',
    metaDescription:
      'A custom, mobile-first website plus full technical and on-page SEO setup, built as one project and booked together at 10% off. For small businesses in Vancouver, BC, across Canada and the US.',
  },
  {
    slug: 'grow-bundle',
    name: 'Grow Bundle',
    tagline: 'Grow Plan + Backlink Building',
    price: '$499.99',
    unit: '/ month',
    note: 'Instead of $599.98 / month on their own.',
    points: ['Monthly website care and SEO improvements', 'Google Business Profile upkeep', 'Relevant, quality backlinks. No link farms', 'Monthly progress update'],
    featured: true,
    menu: 'Monthly SEO, website care and backlinks for $499.99 / month.',
    monthly: '499.99',
    metaTitle: 'Grow Bundle: Monthly SEO + Backlinks, $499.99/mo',
    metaDescription:
      'Monthly SEO, website care, Google Business Profile upkeep and relevant, quality backlinks in one plan for $499.99 a month (CAD), instead of $599.98 on their own. No link farms.',
  },
  {
    slug: 'all-in-starter',
    name: 'All-in Starter',
    tagline: 'Launch Bundle + 3 months of Grow',
    price: '10% off',
    unit: 'your launch, plus 3 months of Grow at $499.99 / month',
    note: 'Launch your site, then grow it from day one.',
    points: ['Everything in the Launch Bundle', 'First 3 months of the Grow Bundle', 'Month-by-month progress page', 'Continue month to month after that'],
    menu: 'Launch your website, then 3 months of growth.',
    metaTitle: 'All-in Starter: Website, SEO + 3 Months of Growth',
    metaDescription:
      'Launch a new website with SEO setup at 10% off, then grow it from day one with 3 months of monthly SEO and backlinks at $499.99 a month (CAD). One team, one plan.',
  },
  {
    slug: 'linocon-complete',
    name: 'LinoCon Complete',
    tagline: 'Launch + Grow + your own bookkeeping app',
    price: '$549.99',
    unit: '/ month for 12 months',
    note: 'Then $499.99 / month, and the bookkeeping app is yours. Plus your Launch Bundle invoice.',
    points: ['Launch Bundle: website + SEO setup', 'Grow Bundle: monthly growth + backlinks', 'LinoCon Books: your own bookkeeping app', 'Books Care included while you stay on Grow'],
    comingSoon: true,
    menu: 'Coming soon: everything, plus your own books.',
    monthly: '549.99',
    metaTitle: 'LinoCon Complete: Website, SEO + Your Own Books',
    metaDescription:
      'Coming soon: your website, SEO, monthly growth, backlinks and your own LinoCon Books bookkeeping app in one bundle. $549.99 a month for 12 months, then $499.99 (CAD). Join the waitlist.',
  },
]

export function getBundle(slug) {
  return BUNDLES.find((b) => b.slug === slug)
}

export const bundlePath = (b) => `/bundles/${b.slug}`
