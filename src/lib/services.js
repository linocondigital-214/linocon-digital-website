// The three services. The homepage section (which adds LinoCon Books as a 4th, see books.js), the Services menu, the footer and
// each service's own page (/services/<slug>) all read from this list.
// Each service page's full content lives in servicePages.js, which only loads
// with the page itself.
export const SERVICES = [
  {
    slug: 'website-creation',
    name: 'Website Creation',
    menu: 'Fast, custom sites that turn visitors into enquiries.',
    kicker: '01 — Website Creation',
    title: 'Sites built to convert, not just exist.',
    body: 'Custom-built websites that load fast and turn visitors into leads. Not another templated theme.',
    points: ['Custom design for your brand', 'Built mobile-first', 'Enquiry forms and call booking built in'],
    image: 'web',
    alt: 'A fast, mobile-friendly business website receiving a new enquiry',
    metaTitle: 'Website Creation for Small Businesses',
    metaDescription:
      'Fast, modern, mobile-first websites designed around your business, your customers and the actions you want visitors to take, with SEO fundamentals built in from the start.',
    article: 'small-business-website-cost-canada',
  },
  {
    slug: 'seo-setup',
    name: 'SEO Setup',
    menu: 'The technical foundation Google needs to rank you.',
    kicker: '02 — SEO Setup',
    title: 'A technical foundation Google can actually rank.',
    body: 'Complete on-page and technical SEO, so Google understands what you do and who you serve.',
    points: ['Keyword mapping', 'Site structure and metadata', 'Speed fixes'],
    image: 'seo',
    alt: 'A business ranking first on Google with organic traffic trending up',
    metaTitle: 'SEO Setup for Small Businesses',
    metaDescription:
      'Complete technical and on-page SEO that helps search engines understand what you do, who you serve, and which searches your business should appear for.',
    article: 'small-business-seo-first-90-days',
  },
  {
    slug: 'backlink-building',
    name: 'Backlink Building',
    menu: 'Quality links that build trust and rankings.',
    kicker: '03 — Backlink Building',
    title: 'Authority that compounds, not spam that gets penalized.',
    body: 'High-authority backlinks that move your rankings, without the spammy links that get sites penalized.',
    points: ['High-authority placements', 'Relevant to your industry', 'No link farms, ever'],
    image: 'links',
    alt: 'High-authority websites linking to your site to build its authority',
    metaTitle: 'Backlink Building for Small Businesses',
    metaDescription:
      "Relevant, quality backlinks that strengthen your website's authority and support your broader SEO strategy. Quality over volume, no link farms, no guaranteed-ranking promises.",
    article: 'what-are-backlinks',
  },
]

export function getService(slug) {
  return SERVICES.find((s) => s.slug === slug)
}

export const servicePath = (s) => `/services/${s.slug}`
