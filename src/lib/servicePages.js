// The full content of each service page (/services/<slug>), keyed by slug.
// Only the service page imports this, so it stays out of the first download.
//
// Each page is a hero (`accent` is the part of the headline shown in the brand
// gradient, as in the banner image), then `sections` rendered in order by
// src/components/PageSections.jsx. Section types: cards, checklist, flow, text,
// pair (two sections side by side), process, proof (our real projects), note
// and groups (several titled lists).
export const SERVICE_PAGES = {
  'website-creation': {
    headline: 'Sites built to convert, not just exist.',
    accent: 'convert',
    intro:
      'We build fast, modern websites designed around your business, your customers, and the actions you want visitors to take. Every site is built mobile-first, with conversion and SEO fundamentals considered from the start.',
    image: 'service-web',
    imageSize: [1080, 1080],
    imageAlt:
      'A responsive business website on a laptop and phone, with page speed, more visitors and more enquiries highlighted',
    sections: [
      {
        type: 'checklist',
        eyebrow: 'What we build',
        heading: 'Websites for every stage of your business.',
        intro:
          "From a first business website to a complete redesign, every project is planned around what your business needs, not picked from a template catalogue.",
        items: [
          'Business websites',
          'Service-based websites',
          'Landing pages',
          'Website redesigns',
          'Mobile-first responsive experiences',
          'Conversion-focused pages',
        ],
      },
      {
        type: 'cards',
        eyebrow: 'Our approach',
        heading: 'What makes a LinoCon Digital website different?',
        items: [
          { title: 'Custom design', body: 'The website is shaped around your business, audience, brand and goals.' },
          { title: 'Mobile-first', body: 'The experience is designed for phones first, then expanded to larger screens.' },
          { title: 'Performance', body: 'Fast-loading pages and efficient assets are treated as part of the build.' },
          {
            title: 'Conversion',
            body: 'Calls to action, forms and page structure are designed around the visitor journey.',
          },
          {
            title: 'SEO-ready foundation',
            body: 'Structure, headings, metadata and technical fundamentals are considered from the beginning.',
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: "What's included",
        heading: 'Everything you need, from plan to launch.',
        intro: "A clear list of what you get, so you know what you're paying for before you call.",
        items: [
          'Discovery and project planning',
          'Sitemap and page structure',
          'Responsive page design',
          'Content structure and calls to action',
          'Contact and enquiry forms',
          'Basic technical SEO foundations',
          'Performance optimization',
          'Mobile, tablet and desktop checks',
          'Launch support',
        ],
      },
      {
        type: 'flow',
        eyebrow: 'Built for the visitor journey',
        heading: 'A website should guide visitors somewhere useful.',
        body: "A website isn't just a collection of pages. Every page is planned to move a visitor from finding you to taking a useful next step.",
        steps: [
          { title: 'Discover', body: 'They find you through Google, social media or a referral.' },
          { title: 'Understand', body: 'They quickly see what you do and who it is for.' },
          { title: 'Trust', body: 'Clear information and real work give them confidence.' },
          { title: 'Act', body: 'They take the next step that fits your business.' },
        ],
        note: 'That action might be requesting a quote, booking a call, sending an enquiry, making a purchase or visiting your location, depending on your business.',
      },
      {
        type: 'pair',
        items: [
          {
            type: 'text',
            eyebrow: 'Mobile-first by design',
            heading: 'Designed for the phone in your customer’s hand.',
            body: [
              'A large share of browsing happens on phones, so small screens are designed first, not squeezed in at the end.',
              'Navigation, readability, buttons, forms and page speed are all planned for mobile, then expanded for tablets and desktops.',
            ],
          },
          {
            type: 'text',
            eyebrow: 'Performance & SEO foundation',
            heading: 'Ready to be found from day one.',
            quote:
              'A strong website should give SEO something worth optimizing. We build with clean structure, useful content hierarchy, performance and essential technical foundations in mind from the start.',
            link: { to: '/services/seo-setup', label: 'More about SEO Setup' },
          },
        ],
      },
      {
        type: 'process',
        eyebrow: 'The build process',
        heading: 'Four clear stages, from first call to launch.',
        steps: [
          { title: 'Strategy', body: 'Understand the business, audience, goals and required pages.' },
          { title: 'Build', body: 'Design and develop the website around the agreed structure.' },
          {
            title: 'Optimize',
            body: 'Test responsiveness, performance, content structure and technical foundations.',
          },
          { title: 'Launch', body: 'Final checks, deployment and handoff.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Who is this for?',
        heading: 'Built for businesses that want their website to work.',
        items: [
          'Small and growing businesses',
          'Service businesses',
          'Professional firms',
          'Local businesses',
          'Startups and entrepreneurs',
          'Businesses replacing an outdated website',
        ],
      },
      { type: 'proof', eyebrow: 'Our work', heading: 'Recent websites we’ve built.' },
    ],
    cta: {
      heading: 'Ready for a website that works harder for your business?',
      body: "Tell us what you're building, what isn't working, or what you want your new website to accomplish. We'll help you determine the right next step.",
    },
  },
  'seo-setup': {
    headline: 'A technical foundation built for search.',
    accent: 'built for search.',
    intro:
      'Complete technical and on-page SEO that helps search engines understand what you do, who you serve, and which searches your business should appear for.',
    image: 'service-seo',
    imageSize: [1080, 1026],
    imageAlt:
      'A business listing in Google search results, with an optimized website leading to better search visibility and more qualified traffic',
    sections: [
      {
        type: 'checklist',
        eyebrow: 'What SEO setup is designed to do',
        heading: 'A search foundation Google can understand.',
        intro:
          'SEO setup makes it easier for search engines to crawl, understand, index and evaluate your website. In plain terms, Google gets a clear picture of what you offer, who it is for, and which page should show up for which search. It is designed to give you:',
        items: [
          'A clearer website structure',
          'Stronger search relevance',
          'Improved technical health',
          'Better page understanding',
          'Stronger internal linking',
          'A foundation for ongoing organic growth',
        ],
      },
      {
        type: 'cards',
        eyebrow: 'Core SEO services',
        heading: 'What we work on.',
        items: [
          {
            title: 'Keyword & search-intent mapping',
            body: 'Identify relevant topics, queries and search intent connected to your business and your customers.',
          },
          {
            title: 'Site structure',
            body: 'Organize pages, navigation, URLs and internal relationships so the site is easier to understand.',
          },
          {
            title: 'Metadata & page signals',
            body: 'Improve titles, meta descriptions, headings and other important page-level signals.',
          },
          {
            title: 'Technical SEO',
            body: 'Review crawlability, indexing, canonicalization, redirects, broken links and other technical foundations.',
          },
          {
            title: 'On-page optimization',
            body: 'Improve page content structure, headings, internal links and relevance to the intended search.',
          },
          {
            title: 'Performance setup',
            body: 'Address important page-speed and technical performance issues where applicable.',
          },
          {
            title: 'Search performance setup',
            body: 'Set up or review the right search and analytics tools so progress can be measured.',
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'What you get',
        heading: 'A clear foundation and a plan you can act on.',
        intro: 'Depending on the project scope, deliverables can include:',
        items: [
          'An SEO audit',
          'Keyword mapping',
          'Technical recommendations',
          'On-page optimization',
          'Metadata work',
          'Internal-linking recommendations',
          'Indexing checks',
          'Search performance setup',
        ],
      },
      {
        type: 'pair',
        items: [
          {
            type: 'flow',
            eyebrow: 'Technical SEO',
            heading: 'The infrastructure layer.',
            body: 'Search engines need to access, crawl, interpret and index your important pages before they can rank them. Technical SEO makes sure nothing in how your site is built holds that back. It is essential, but on its own it does not guarantee rankings.',
            steps: [{ title: 'Crawl' }, { title: 'Understand' }, { title: 'Index' }, { title: 'Evaluate' }],
          },
          {
            type: 'text',
            eyebrow: 'On-page SEO',
            heading: 'Connecting pages to the searches that matter.',
            body: [
              'Titles, headings, content structure, search intent, internal links, image optimization and other page signals are tuned so each page clearly matches the search it is meant for.',
            ],
            quote: 'Every important page should make sense to both the person reading it and the search engine interpreting it.',
          },
        ],
      },
      {
        type: 'text',
        eyebrow: 'Search intent & keyword mapping',
        heading: 'More than a list of popular keywords.',
        body: [
          'Keyword research is not about collecting the highest-volume search terms. It is about understanding what your potential customers are actually trying to accomplish, then matching each of those searches to the right page on your site.',
        ],
      },
      {
        type: 'pair',
        items: [
          {
            type: 'flow',
            eyebrow: 'SEO + your website',
            heading: 'A strong website gives SEO something to work with.',
            body: 'Your website provides the structure and content. SEO makes that structure understandable and discoverable.',
            steps: [
              { title: 'Website' },
              { title: 'SEO foundation' },
              { title: 'Search visibility' },
              { title: 'Qualified opportunities' },
            ],
            link: { to: '/services/website-creation', label: 'More about Website Creation' },
          },
          {
            type: 'text',
            eyebrow: 'SEO + backlinks',
            heading: 'Authority works best on a solid foundation.',
            body: [
              'Backlink building should support a strong SEO foundation, not replace it. Relevant authority signals do the most good when the website underneath is technically sound, useful and properly optimized.',
            ],
            link: { to: '/services/backlink-building', label: 'More about Backlink Building' },
          },
        ],
      },
      {
        type: 'process',
        eyebrow: 'How the SEO process works',
        heading: 'Audit, plan, optimize, measure.',
        steps: [
          {
            title: 'Audit',
            body: 'Review the current website and identify technical, structural and on-page opportunities.',
          },
          { title: 'Strategy', body: 'Map search intent, priorities and the pages that matter most.' },
          { title: 'Optimize', body: 'Implement or document the agreed improvements.' },
          { title: 'Measure', body: 'Set up the right tracking and review performance over time.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Who is this for?',
        heading: 'For websites that deserve to be found.',
        items: [
          'Businesses with an existing website that want a stronger search foundation',
          'Businesses preparing a new website',
          'Companies with declining or weak organic visibility',
          'Businesses that want their site properly prepared before investing more in content or backlinks',
        ],
      },
      {
        type: 'note',
        eyebrow: 'What SEO does not promise',
        heading: 'No guaranteed rankings. A strong foundation instead.',
        body: 'SEO is a long-term discipline. Rankings, traffic and conversions depend on competition, search behaviour, website quality, content, authority and other factors. We provide a strong foundation and strategic optimization, not guaranteed rankings.',
      },
    ],
    cta: {
      heading: 'Find out what your website is missing.',
      body: "Get a closer look at your website's search foundation and identify the opportunities worth addressing first.",
    },
  },
  'backlink-building': {
    headline: 'Build authority that supports your growth.',
    accent: 'your growth.',
    intro:
      "Relevant, quality backlinks that strengthen your website's authority and support your broader SEO strategy.",
    image: 'service-links',
    imageSize: [1080, 953],
    imageAlt:
      'A business website connected to industry magazines, news sites, niche blogs, directories and partner websites, leading to stronger authority and long-term growth',
    sections: [
      {
        type: 'text',
        eyebrow: 'What backlinks actually do',
        heading: 'Links are one signal among many.',
        body: [
          'A backlink is a link from another website to yours. Search engines may use links as one of many signals when evaluating pages and websites.',
          'The value of a link depends heavily on context, relevance, quality and how naturally it fits within the wider web. Backlinks are not a guaranteed shortcut to page one. They are one part of a broader organic search strategy.',
        ],
      },
      {
        type: 'cards',
        eyebrow: 'The LinoCon Digital approach',
        heading: 'Quality, relevance and the long game.',
        items: [
          {
            title: 'Relevance first',
            body: 'Prioritize websites and placements that make sense for your business, industry, topic or audience.',
          },
          {
            title: 'Quality over volume',
            body: 'A smaller number of useful, credible opportunities can be worth more than mass-produced links.',
          },
          {
            title: 'Natural profile',
            body: 'Build links in a way that looks appropriate within the broader web.',
          },
          {
            title: 'Context matters',
            body: 'Links should appear in meaningful content or useful resources, not on random pages.',
          },
          {
            title: 'Long-term strategy',
            body: "Backlink work supports your site's broader SEO foundation instead of acting as a standalone shortcut.",
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Types of opportunities',
        heading: 'Where good links come from.',
        intro: 'Depending on your business and campaign, we may look at:',
        items: [
          'Industry publications and magazines',
          'Relevant niche websites and blogs',
          'Editorial and media opportunities',
          'Local or industry-specific directories where appropriate',
          'Partner and association websites',
          'Resource pages and useful industry references',
          'Digital PR and content-led opportunities',
        ],
      },
      {
        type: 'checklist',
        tone: 'avoid',
        eyebrow: 'What we avoid',
        heading: 'Shortcuts that do more harm than good.',
        items: [
          'Mass link packages',
          'Irrelevant websites',
          'Obvious link farms',
          'Automated or bulk-generated placements',
          'Paid placements presented deceptively as editorial links',
          'Tactics designed only to manipulate search engines',
        ],
        quote:
          'We focus on links that make sense for your business, not a spreadsheet full of links that nobody would naturally trust.',
      },
      {
        type: 'pair',
        items: [
          {
            type: 'flow',
            eyebrow: 'Backlinks + SEO',
            heading: 'Authority works best on a solid foundation.',
            body: 'Backlink building does the most good when the website already has a solid technical and on-page foundation: a useful website, technical SEO and relevant content, then authority-building opportunities.',
            steps: [
              { title: 'Website' },
              { title: 'SEO foundation' },
              { title: 'Relevant authority' },
              { title: 'Stronger search presence' },
            ],
            link: { to: '/services/seo-setup', label: 'More about SEO Setup' },
          },
          {
            type: 'text',
            eyebrow: 'Backlinks + content',
            heading: 'Give other websites a reason to link.',
            body: [
              'Where it fits, backlink opportunities are connected to useful content: guides, research, case studies and resources that another website would have a genuine reason to reference.',
            ],
          },
        ],
      },
      {
        type: 'process',
        eyebrow: 'The backlink building process',
        heading: 'Ethical, transparent and tracked.',
        steps: [
          {
            title: 'Review',
            body: 'Assess the website, industry, existing backlink profile and opportunities.',
          },
          {
            title: 'Research',
            body: 'Identify relevant websites, publications, directories and relationship opportunities.',
          },
          {
            title: 'Outreach & placement',
            body: 'Pursue appropriate opportunities using ethical, transparent methods.',
          },
          { title: 'Monitor', body: 'Track acquired links and evaluate their relevance and quality over time.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Who is this for?',
        heading: 'For businesses ready to build authority.',
        items: [
          'Businesses with a solid website and SEO foundation that want to strengthen authority',
          'Businesses entering competitive search markets',
          'Brands with useful content that deserves wider exposure',
          'Businesses looking for a longer-term organic visibility strategy',
        ],
      },
      {
        type: 'note',
        eyebrow: 'What backlink building does not promise',
        heading: 'No guaranteed rankings, traffic or revenue.',
        body: 'No responsible backlink service should guarantee a specific Google ranking, traffic increase or revenue result. Search performance depends on competition, content, technical SEO, search intent, website quality, authority and many other factors.',
      },
      {
        type: 'checklist',
        eyebrow: 'Reporting & transparency',
        heading: "You'll see what was done and why it matters.",
        intro: 'Clear reporting, without vanity metrics that nobody explains. You can expect:',
        items: [
          'Acquired placements, where applicable',
          'The source websites',
          'Relevant metrics, with context on what they mean',
          'Campaign progress',
          'Strategic observations and next steps',
        ],
      },
    ],
    cta: {
      heading: 'Build authority the right way.',
      body: "If your website already has a solid foundation, let's identify the opportunities that could strengthen its authority and support your broader SEO strategy.",
    },
  },
}
