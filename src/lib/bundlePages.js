// The full content of each bundle page (/bundles/<slug>), keyed by slug.
// Only the bundle page imports this, so it stays out of the first download.
//
// Facts only come from what the site and Lino's price list already say: prices
// in CAD, no invented numbers. `sections` use the shared section types in
// src/components/PageSections.jsx. `savings` is the "What it costs" table,
// `faq` the questions at the bottom (also sent to Google as FAQPage data, see
// src/entry-server.jsx), `reading` the article slugs shown once published.

const WEBSITE_ITEMS = [
  'Discovery and project planning',
  'Sitemap and page structure',
  'Custom, mobile-first page design',
  'Content structure and clear calls to action',
  'Enquiry forms and call booking built in',
  'Fast-loading pages',
  'Checks on phone, tablet and desktop',
  'Launch support',
]

const SEO_ITEMS = [
  'Keyword and search-intent mapping',
  'Page titles, descriptions and headings',
  'Site structure and internal links',
  'Technical SEO: crawling, indexing, redirects, broken links',
  'Sitemap and structured data where it helps',
  'Google Search Console and analytics set up or checked',
]

const GROW_ITEMS = [
  'Monthly review of your Search Console, analytics and enquiries',
  'Technical health check, with new issues fixed',
  'SEO and content improvements guided by the data',
  'Google Business Profile upkeep',
  'Better calls to action and enquiry paths',
  'A monthly progress update in plain words',
  'A quarterly review against where you started',
]

const BACKLINK_ITEMS = [
  'Research into relevant local and industry sites',
  'Local citations and business listings',
  'Placements and relationships where they fit',
  'A quality check on every new link',
  'A record of every link we build',
  'No link farms or spammy link schemes, ever',
]

const GROW_BUNDLE_LINE = { item: 'Grow Plan + Backlink Building', alone: '$599.98 / month', bundle: '$499.99 / month' }

export const BUNDLE_PAGES = {
  'launch-bundle': {
    kicker: 'Bundle — Website Creation + SEO Setup',
    headline: 'A new website, ready for Google from day one.',
    accent: 'ready for Google',
    intro:
      'The Launch Bundle puts Website Creation and SEO Setup together. You get a fast, custom website and the technical SEO Google needs to understand it, built as one project and booked together at 10% off.',
    sections: [
      {
        type: 'text',
        eyebrow: 'Why together',
        heading: 'SEO works best when it’s built in, not added later.',
        body: [
          'Many websites look good but were never set up for search. Fixing that later means going back over pages that are already finished.',
          'With the Launch Bundle, the page structure, headings, titles and technical setup are planned from the very first call, so your new website is ready to be found the day it goes live.',
        ],
      },
      {
        type: 'groups',
        eyebrow: 'What you get',
        heading: 'Everything in the Launch Bundle.',
        intro: 'Two full services, one project and one team. Here is what is included.',
        groups: [
          { title: 'Website Creation', items: WEBSITE_ITEMS },
          { title: 'SEO Setup', items: SEO_ITEMS },
        ],
        note: 'a website you own, set up so Google can understand what you do, who you serve and where you work.',
      },
      {
        type: 'process',
        eyebrow: 'How it works',
        heading: 'Four simple steps, all online.',
        steps: [
          { title: 'Free call', body: 'We talk about your business, your customers and what your website needs to do.' },
          { title: 'Plan and quote', body: 'You get a written plan and a clear quote with the 10% already taken off. If you go ahead, you sign online.' },
          { title: 'Build and SEO', body: 'We build your website and set up the SEO. You follow along on your own client page and approve each step.' },
          { title: 'Launch', body: 'Final checks on every screen size, then your website goes live with tracking ready.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Who it’s for',
        heading: 'A good fit if you need a website that gets found.',
        items: [
          'New businesses with no website yet',
          'Businesses replacing an outdated website',
          'Owners who only have a Facebook page',
          'Local service businesses and trades',
          'Professional firms and consultants',
          'Anyone who wants it done right the first time',
        ],
      },
    ],
    savings: {
      rows: [
        { item: 'Website Creation', alone: 'Quoted for your project', bundle: '10% off' },
        { item: 'SEO Setup', alone: 'One-time price', bundle: '10% off' },
      ],
      note: 'Every website is different, so your website is quoted after a free strategy call. The 10% comes off both services, and your quote shows the exact amounts before any work starts. Usually paid as a deposit to start and the rest at launch.',
    },
    next: { slug: 'all-in-starter', text: 'Want to keep growing after launch? The All-in Starter adds 3 months of the Grow Bundle.' },
    faq: [
      {
        title: 'How much does the Launch Bundle cost?',
        body: 'Your website is quoted for your project after a free strategy call, because every business needs something different. SEO Setup is added to the same quote, and 10% comes off both. Prices are in Canadian dollars, with taxes extra where they apply.',
      },
      {
        title: 'I already have a website. Is this for me?',
        body: 'It can be. Website Creation includes redesigns, so if your current site is outdated or slow we can rebuild it with SEO built in. If your site is fine and only needs the SEO side, SEO Setup on its own may be enough. A free audit is the easiest way to find out.',
      },
      {
        title: 'What happens after my website launches?',
        body: 'The website is yours. Many businesses then add the Grow Bundle, which keeps improving your SEO and builds quality backlinks every month. The All-in Starter includes the first 3 months of it.',
      },
      {
        title: 'How soon will I show up on Google?',
        body: 'The technical foundation is in place from launch day, but Google needs time to crawl, understand and rank a new website. How long depends on your industry, your competition and your area. SEO is a long-term process, and the Launch Bundle gives it the right start.',
      },
      {
        title: 'Do you only work with businesses in Vancouver?',
        body: 'No. We are based in Vancouver, BC, and work online with small businesses across Canada and the US. Calls, approvals and signing all happen online.',
      },
    ],
    reading: ['small-business-website-cost-canada', 'what-is-seo-setup', 'essential-small-business-website-pages'],
    cta: {
      heading: 'Ready to launch a website that gets found?',
      body: 'Book a free strategy call. We’ll talk about your business and send you a clear quote with your Launch Bundle saving.',
    },
  },

  'grow-bundle': {
    kicker: 'Bundle — Grow Plan + Backlink Building',
    headline: 'Get found by more customers, month after month.',
    accent: 'month after month',
    intro:
      'The Grow Bundle puts the Grow Plan and Backlink Building together for $499.99 a month. Every month we check your results, improve your website and SEO, keep your Google Business Profile up to date, and build relevant links that help Google trust your site.',
    sections: [
      {
        type: 'text',
        eyebrow: 'Why monthly',
        heading: 'SEO is not a one-time job.',
        body: [
          'Search results change, competitors update their sites, and customers search in new ways. A website that is left alone slowly falls behind.',
          'The Grow Bundle keeps your website moving forward. We use real data from Google to decide what to improve next, and we build your site’s authority with quality links, so your progress adds up over time.',
        ],
        link: { to: '/process/grow', label: 'How we grow websites' },
      },
      {
        type: 'groups',
        eyebrow: 'What you get',
        heading: 'Everything in the Grow Bundle, every month.',
        intro: 'Two monthly services that work together: one improves your website, the other builds its reputation.',
        groups: [
          { title: 'Grow Plan', items: GROW_ITEMS },
          { title: 'Backlink Building', items: BACKLINK_ITEMS },
        ],
        note: 'steady, measured progress on Google, and a clear update each month on what we did and what comes next.',
      },
      {
        type: 'process',
        eyebrow: 'Each month',
        heading: 'A simple monthly cycle.',
        steps: [
          { title: 'Measure', body: 'We look at your search visibility, visitors and enquiries to see what changed.' },
          { title: 'Plan', body: 'We pick the improvements that will help your business most this month.' },
          { title: 'Improve', body: 'We make the changes and build new, relevant links to your site.' },
          { title: 'Report', body: 'You get a plain-words update, and your client page shows the work.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Who it’s for',
        heading: 'A good fit if your website should be bringing in more work.',
        items: [
          'Businesses with a website that gets few enquiries',
          'Businesses that just launched a new website',
          'Local businesses that want to show up in their area',
          'Owners with no time to work on SEO',
          'Businesses with competitors ahead of them on Google',
          'Anyone who wants growth without the guesswork',
        ],
      },
    ],
    savings: {
      rows: [
        { item: 'Grow Plan', alone: '$349.99 / month', bundle: 'Included' },
        { item: 'Backlink Building', alone: '$249.99 / month', bundle: 'Included' },
        { ...GROW_BUNDLE_LINE, total: true },
      ],
      note: 'You save $99.99 every month compared with buying the two services on their own. Billed monthly and charged automatically to your card or bank account. Your agreement shows the minimum term and the notice to cancel before you sign.',
    },
    next: { slug: 'all-in-starter', text: 'Need a new website first? The All-in Starter launches your website, then starts the Grow Bundle.' },
    faq: [
      {
        title: 'What’s the difference between the Grow Plan and the Grow Bundle?',
        body: 'The Grow Plan is our monthly website care and SEO service. The Grow Bundle is the Grow Plan plus Backlink Building, together for $499.99 a month instead of $599.98.',
      },
      {
        title: 'Do I need a website built by you?',
        body: 'No. We can grow the website you already have. We start by looking at your current site, and if something needs fixing first, we tell you before you sign up.',
      },
      {
        title: 'Can you guarantee first place on Google?',
        body: 'No one honestly can. Google decides rankings, and results depend on your industry, competition and area. What we promise is steady, careful work guided by real data, and a clear report of what we did each month.',
      },
      {
        title: 'Are your backlinks safe?',
        body: 'Yes. We build relevant, quality links from real local and industry sites, and keep a record of every one. We never use link farms, automated link schemes or irrelevant placements.',
      },
      {
        title: 'How will I know it’s working?',
        body: 'Each month you get a progress update in plain words: what changed, what we did and what comes next. Every quarter we compare your results with where you started.',
      },
    ],
    reading: ['what-is-seo-setup', 'make-your-small-business-website-trustworthy', '2027-digital-growth-plan'],
    cta: {
      heading: 'Ready to grow every month?',
      body: 'Book a free strategy call. We’ll look at where your website stands today and what the Grow Bundle would focus on first.',
    },
  },

  'all-in-starter': {
    kicker: 'Bundle — Launch Bundle + 3 months of Grow',
    headline: 'Launch your website, then grow it from day one.',
    accent: 'grow it from day one',
    intro:
      'The All-in Starter is our complete start. We build your new website with SEO built in at 10% off, then keep improving it with the Grow Bundle for your first 3 months, so you don’t launch and then wait.',
    sections: [
      {
        type: 'flow',
        eyebrow: 'Your first months',
        heading: 'One plan from first call to steady growth.',
        steps: [
          { title: 'Launch', body: 'Your new website and SEO setup, built together at 10% off.' },
          { title: 'Month 1', body: 'The Grow Bundle starts after launch: first data, first improvements.' },
          { title: 'Months 2 and 3', body: 'Monthly SEO, content work and quality backlinks build up.' },
          { title: 'After that', body: 'Continue month to month at $499.99, with your results to guide you.' },
        ],
        note: 'The first weeks after launch are when a new website needs the most attention. With the All-in Starter, that work is already planned.',
      },
      {
        type: 'groups',
        eyebrow: 'What you get',
        heading: 'Everything in the All-in Starter.',
        intro: 'All four of our website services, in the right order.',
        groups: [
          { title: 'Website Creation', items: WEBSITE_ITEMS.slice(0, 6) },
          { title: 'SEO Setup', items: SEO_ITEMS },
          { title: 'Grow Plan (3 months, then month to month)', items: GROW_ITEMS.slice(0, 6) },
          { title: 'Backlink Building (3 months, then month to month)', items: BACKLINK_ITEMS },
        ],
        note: 'a new website that is ready for Google, plus 3 months of steady growth work, and a client page where you can follow every step.',
      },
      {
        type: 'cards',
        eyebrow: 'Why it works',
        heading: 'Launch and growth, planned by the same team.',
        items: [
          { title: 'No gap after launch', body: 'Growth work starts as soon as your website is live, not months later.' },
          { title: 'One team that knows your site', body: 'The people who built your website are the ones improving it, so nothing is lost in a handover.' },
          { title: 'Month-by-month progress page', body: 'Your own client page shows what was done, what is next and your monthly updates.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Who it’s for',
        heading: 'A good fit if you want the whole job done.',
        items: [
          'New businesses starting from zero',
          'Businesses replacing a website that never brought in work',
          'Owners who want one team for everything',
          'Local businesses that want to show up in their area fast',
          'Anyone who doesn’t want to launch and then wait',
          'Businesses planning to grow over the next year',
        ],
      },
    ],
    savings: {
      rows: [
        { item: 'Website Creation + SEO Setup', alone: 'Quoted for your project', bundle: '10% off' },
        { ...GROW_BUNDLE_LINE, item: 'Grow Bundle, first 3 months' },
        { item: 'After month 3', alone: '', bundle: 'Month to month at $499.99' },
      ],
      note: 'Your website is quoted after a free strategy call, with 10% off the website and SEO Setup. The Grow Bundle starts after launch and saves $99.99 a month compared with the Grow Plan and Backlink Building on their own.',
    },
    next: { slug: 'linocon-complete', text: 'Want your own bookkeeping app too? LinoCon Complete adds LinoCon Books (coming soon).' },
    faq: [
      {
        title: 'When do the monthly payments start?',
        body: 'The Grow Bundle starts after your website launches. Your website and SEO Setup are paid on their own invoice, with the 10% saving, and the $499.99 monthly payments begin once you are live.',
      },
      {
        title: 'What happens after the first 3 months?',
        body: 'The Grow Bundle continues month to month at $499.99, so your website keeps improving. Your agreement shows the notice needed to stop, before you sign.',
      },
      {
        title: 'How is this different from the Launch Bundle?',
        body: 'The Launch Bundle is your new website and SEO setup. The All-in Starter is the same launch, plus the first 3 months of the Grow Bundle, so growth work starts right after launch.',
      },
      {
        title: 'How much does it cost in total?',
        body: 'It depends on your website, which is quoted for your project after a free call. Your quote shows the website and SEO Setup with 10% off, plus 3 months of the Grow Bundle at $499.99 a month. Prices are in Canadian dollars, with taxes extra where they apply.',
      },
      {
        title: 'Can I follow the work?',
        body: 'Yes. Every client gets a private client page with the project steps, documents and monthly updates.',
      },
    ],
    reading: ['small-business-website-cost-canada', 'what-is-seo-setup', 'essential-small-business-website-pages'],
    cta: {
      heading: 'Ready for the complete start?',
      body: 'Book a free strategy call. We’ll plan your launch and your first 3 months of growth together.',
    },
  },

  'linocon-complete': {
    kicker: 'Bundle — Coming soon',
    headline: 'Your website, your growth and your own books.',
    accent: 'your own books',
    intro:
      'LinoCon Complete is everything we do in one bundle: a new website with SEO, monthly growth and backlinks, plus LinoCon Books, your own bookkeeping app. Pay $549.99 a month for 12 months, then $499.99, and the app is yours to keep.',
    sections: [
      {
        type: 'text',
        eyebrow: 'The idea',
        heading: 'One bundle for the whole business side.',
        body: [
          'Your website brings customers in. SEO and backlinks keep them coming. Your bookkeeping app keeps the money organized.',
          'Most businesses pay for these separately, from different companies, and keep paying for bookkeeping software forever. With LinoCon Complete you get all of it from one team, and after 12 months the bookkeeping app belongs to you.',
        ],
        link: { to: '/books', label: 'More about LinoCon Books' },
      },
      {
        type: 'groups',
        eyebrow: 'What you get',
        heading: 'Everything in LinoCon Complete.',
        intro: 'LinoCon Complete is coming soon. Here is what it will include.',
        groups: [
          { title: 'Launch Bundle', items: ['A custom, mobile-first website', 'Enquiry forms and call booking built in', 'Technical and on-page SEO setup', 'Search Console and analytics tracking', '10% off the website and SEO Setup'] },
          { title: 'Grow Bundle', items: ['Monthly website care and SEO improvements', 'Google Business Profile upkeep', 'Relevant, quality backlinks. No link farms', 'A monthly progress update'] },
          {
            title: 'LinoCon Books, your own app',
            items: [
              'Dashboard: money in, money out, profit',
              'Expenses with receipt photos',
              'Branded invoices with a Pay now button',
              'Sales tax report for each filing period',
              'Year-end summary and a bookkeeper login',
              'On your own domain, and yours after 12 months',
            ],
          },
          { title: 'Books Care, included', items: ['Hosting and backups', 'Security and tax-rule updates', 'Support', 'Included free while you stay on the Grow Bundle'] },
        ],
        note: 'your website, your growth and your books, looked after by one team, and a bookkeeping app you own.',
      },
      {
        type: 'flow',
        eyebrow: 'How the payments work',
        heading: 'Clear from the start.',
        steps: [
          { title: 'Start', body: 'Your Launch Bundle invoice: website and SEO Setup at 10% off.' },
          { title: 'Months 1 to 12', body: '$549.99 a month for the Grow Bundle and your LinoCon Books app.' },
          { title: 'Month 13 on', body: '$499.99 a month. The bookkeeping app is now yours.' },
          { title: 'Books Care', body: 'Included for as long as you stay on the Grow Bundle.' },
        ],
      },
    ],
    savings: {
      rows: [
        { item: 'Website Creation + SEO Setup', alone: 'Quoted for your project', bundle: '10% off' },
        { ...GROW_BUNDLE_LINE, item: 'Grow Plan + Backlink Building, months 1 to 12', bundle: '$549.99 / month, with your Books app' },
        { item: 'Month 13 onward', alone: '', bundle: '$499.99 / month, the app is yours' },
      ],
      note: 'Inside the bundle, your bookkeeping app adds $50 a month for 12 months, and nothing after that. Prices are founding-client prices in Canadian dollars, with taxes extra where they apply.',
    },
    next: { slug: 'all-in-starter', text: 'Don’t need bookkeeping? The All-in Starter is available now.' },
    faq: [
      {
        title: 'When will LinoCon Complete be available?',
        body: 'Soon. It opens when LinoCon Books launches. Join the waitlist, with nothing to pay today, and we’ll contact you when your spot is ready.',
      },
      {
        title: 'Do I really own the bookkeeping app?',
        body: 'Yes. After 12 monthly payments, the app on your own domain is yours to keep. There is no subscription for the app after that.',
      },
      {
        title: 'What happens if I stop the Grow Bundle later?',
        body: 'Your website and your bookkeeping app stay yours. Books Care is included only while you are on the Grow Bundle. After that it becomes optional, like for any LinoCon Books owner.',
      },
      {
        title: 'Can I get LinoCon Books without the full bundle?',
        body: 'Yes. LinoCon Books has its own plans, and you can add it to a Launch Bundle for $39.99 a month. See the LinoCon Books page for details.',
      },
      {
        title: 'Can I start with a website now and add Books later?',
        body: 'Yes. You can start with the Launch Bundle or the All-in Starter today, and join the waitlist to add LinoCon Books when it opens.',
      },
    ],
    reading: ['introducing-linocon-books', 'bookkeeping-software-subscription-vs-ownership', 'small-business-website-cost-canada'],
    cta: {
      heading: 'Be first in line for LinoCon Complete.',
      body: 'Join the waitlist for founding-client prices, or book a free strategy call to start with your website now.',
    },
  },
}
