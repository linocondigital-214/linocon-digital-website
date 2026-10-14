// The four process steps. The homepage Process section, the Process menu and
// each step's own page (/process/<slug>) all read from this list.
// A step only gets a menu entry and a "Learn more" button once `hasPage` is
// true, which happens when its full content is added to processPages.js.
export const PROCESS_STEPS = [
  {
    slug: 'audit',
    n: '01',
    name: 'Audit',
    image: 'process-audit',
    body: "We review your current site, rankings and competitors to find exactly what's holding you back.",
    hasPage: true,
    menu: "Find what's holding your business back.",
  },
  {
    slug: 'plan',
    n: '02',
    name: 'Plan',
    image: 'process-plan',
    body: 'You get a clear plan: the pages, the keywords and the links worth chasing, agreed before work starts.',
    hasPage: true,
    menu: 'Turn insights into a clear roadmap.',
  },
  {
    slug: 'build-and-launch',
    n: '03',
    name: 'Build & launch',
    image: 'process-build',
    body: 'We design and build your site with SEO baked in, then launch it.',
    hasPage: true,
    menu: 'Turn strategy into a high-performing website.',
  },
  {
    slug: 'grow',
    n: '04',
    name: 'Grow',
    image: 'process-grow',
    body: 'Ongoing SEO and backlinks, with regular reporting, so rankings and enquiries keep climbing.',
    hasPage: true,
    menu: 'Keep improving. Keep getting found.',
  },
]

export const LIVE_STEPS = PROCESS_STEPS.filter((s) => s.hasPage)

export function getStep(slug) {
  return PROCESS_STEPS.find((s) => s.slug === slug)
}

export const stepPath = (s) => `/process/${s.slug}`
