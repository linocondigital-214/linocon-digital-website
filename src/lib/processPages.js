// The full content of each process step page (/process/<slug>), keyed by slug.
// Only the step page imports this, so it stays out of the first download.
//
// Same shape as servicePages.js: a hero (headline, accent, intro, image) then
// `sections` rendered by src/components/PageSections.jsx, then `cta`.
// Each step also needs `metaTitle` and `metaDescription` for Google.
// Steps are added here as Lino sends their content, and switched on with
// `hasPage: true` in process.js.
export const PROCESS_PAGES = {
  audit: {
    metaTitle: 'Website & SEO Audit for Small Businesses',
    metaDescription:
      "We audit your website, SEO, competitors, local presence and conversion paths to find what's holding your business back, then turn the findings into a prioritized plan.",
    headline: "We find what's holding your business back.",
    accent: 'business back',
    intro:
      'Before we build a new website, change your SEO or start chasing backlinks, we need to understand where you are today. We audit your website, search visibility, competitors, local presence and conversion paths to find the problems and opportunities that matter most.',
    image: 'process-page-audit',
    imageSize: [1080, 678],
    imageAlt:
      'A laptop showing a website audit dashboard with website, SEO, competitor and growth opportunity panels, next to a magnifying glass',
    sections: [
      {
        type: 'text',
        eyebrow: 'Why we start here',
        heading: 'No generic checklist. No guessing.',
        body: [
          'We look at the digital pieces that influence whether the right customers can find you, trust you and contact you, then turn what we find into a prioritized plan.',
          'Before we build or recommend anything, we understand what is happening now, what competitors are doing, and where the highest-value opportunities are.',
        ],
      },
      {
        type: 'cards',
        eyebrow: 'What we audit',
        heading: 'Every part of the audit answers one practical question.',
        items: [
          {
            title: 'Website audit',
            body: 'Is the website helping or hurting enquiries? We assess user experience, performance, structure and conversion.',
          },
          {
            title: 'SEO audit',
            body: 'Can Google understand and rank the site? We assess visibility, technical SEO, content and search intent.',
          },
          {
            title: 'Competitor analysis',
            body: 'What are competitors doing that we can learn from? We compare the competitors that matter and find the gaps.',
          },
          {
            title: 'Conversion audit',
            body: 'Is traffic being turned into opportunities? We review calls to action, trust signals and enquiry paths.',
          },
          {
            title: 'Local presence audit',
            body: 'Can nearby customers find and trust the business? We review local search signals and your business profiles.',
          },
          {
            title: 'Opportunity report',
            body: 'What should we fix, build or grow first? We turn every finding into a prioritized list of actions.',
          },
        ],
      },
      {
        type: 'groups',
        eyebrow: 'Website audit',
        heading: 'Does your website make it easy to understand you, trust you and take action?',
        groups: [
          {
            title: 'Performance and technical foundation',
            items: [
              'Page speed and Core Web Vitals signals',
              'Mobile responsiveness and usability',
              'Broken links, errors and indexing issues',
              'HTTPS, security and basic technical hygiene',
              'Image sizes, formats and unnecessary page weight',
            ],
          },
          {
            title: 'Structure and user experience',
            items: [
              'Navigation clarity and page hierarchy',
              'Whether important services are easy to find',
              'Logical journeys from landing page to enquiry',
              'Readability, spacing and the mobile experience',
              'Whether each page has a clear purpose',
            ],
          },
          {
            title: 'Messaging and trust',
            items: [
              'Does the first screen explain what you do and who you serve?',
              'Is the value proposition specific rather than generic?',
              'Are services explained in customer language?',
              'Is there proof: reviews, projects, credentials or experience?',
              'Does the site answer common objections?',
            ],
          },
          {
            title: 'Conversion and enquiry paths',
            items: [
              'Visibility and placement of calls to action',
              'Friction in quote and contact forms',
              'Phone, email and other ways to get in touch',
              'Consistent calls to action across key pages',
              'Whether visitors know what happens after they enquire',
            ],
          },
        ],
        note: 'You get a prioritized findings list, sorted from critical fixes to optional improvements, so the audit stays actionable instead of turning into a long technical report.',
      },
      {
        type: 'groups',
        eyebrow: 'SEO audit',
        heading: 'Can search engines understand your business, and are you targeting the right searches?',
        groups: [
          {
            title: 'Technical SEO',
            items: [
              'Indexability and crawlability',
              'XML sitemap and robots directives',
              'Canonical tags and duplicate content',
              'Page status codes and redirect issues',
              'Structured data (schema) opportunities',
            ],
          },
          {
            title: 'On-page SEO',
            items: [
              'Title tags and meta descriptions',
              'Heading hierarchy',
              'Primary and supporting keyword alignment',
              'Internal linking',
              'Image alt text and contextual relevance',
            ],
          },
          {
            title: 'Search intent and content',
            items: [
              'Whether pages match what customers actually search for',
              'Service page depth and specificity',
              'Location and service-area opportunities',
              'Content gaps compared with competitors',
              'Educational topics that can attract qualified traffic',
            ],
          },
          {
            title: 'Authority and off-page signals',
            items: [
              'Backlink profile and referring domains',
              'Quality and relevance of existing links',
              'Local citation opportunities',
              'Competitor backlink gaps',
              'Authority-building opportunities',
            ],
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Competitor analysis',
        heading: 'We compare you with the competitors that matter.',
        intro:
          "We don't benchmark your business against the entire internet. We focus on the competitors that matter for your market, your services and your search results.",
        note: 'The result is a concise competitive opportunity map: what competitors do well, where they are vulnerable, and where a different strategy can win.',
        items: [
          'Who appears in relevant Google searches',
          'Which services and pages competitors emphasize',
          'How competitors structure their websites',
          'Which keywords and topics seem to matter',
          'How strong their content and local signals are',
          'Where they have stronger authority or backlinks',
          'Gaps your business can realistically use',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Local presence audit',
        heading: 'Can nearby customers find and trust you?',
        intro:
          'For local businesses, the website is only one part of being found. We also check the signals that help customers find and trust you in your service area.',
        items: [
          'Google Business Profile presence and completeness',
          'Consistent business name, address and phone',
          'Reviews and review-generation opportunities',
          'Local landing pages and service-area relevance',
          'Local citations and directory opportunities',
          'Local backlinks and community relevance',
          'Consistency between your website and external profiles',
        ],
      },
      {
        type: 'flow',
        eyebrow: 'Opportunity report',
        heading: 'Findings turned into a practical roadmap.',
        body: 'This is where the audit becomes useful. Instead of a pile of disconnected observations, every finding gets a priority.',
        steps: [
          {
            title: 'Critical',
            body: 'Fixes that may be blocking performance, indexing or enquiries, like a major technical or indexing issue.',
          },
          {
            title: 'High impact',
            body: 'Changes with strong potential to improve visibility or conversion, like weak service page targeting.',
          },
          { title: 'Growth', body: 'Actions that compound over time, like content and backlink opportunities.' },
          {
            title: 'Optimization',
            body: 'Useful refinements once the foundation is right, like UX or copy improvements.',
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'What you get',
        heading: 'You leave the audit knowing three things.',
        items: [
          'What is holding your business back right now',
          'Which opportunities are worth pursuing',
          'What we recommend doing next, and why',
        ],
      },
      {
        type: 'process',
        eyebrow: 'How it works',
        heading: 'What the audit looks like for you.',
        steps: [
          { title: 'Discovery', body: 'We learn about your business, services, customers, service area and goals.' },
          {
            title: 'Data and access',
            body: 'We review the website, search, analytics and business profile information available.',
          },
          {
            title: 'Audit',
            body: 'We examine the website, SEO, local presence, competitors and conversion paths.',
          },
          { title: 'Prioritization', body: 'We separate the important findings from low-value noise.' },
          { title: 'Recommendations', body: 'We explain what should be fixed, built or improved.' },
          { title: 'Next step', body: 'The findings feed directly into the Plan stage.' },
        ],
      },
      {
        type: 'note',
        eyebrow: 'How it connects',
        heading: 'Audit is where we understand. Plan is where we decide.',
        body: 'We understand the business, the website, the search landscape, the competitors and the customer journey. The next stage turns those findings into a clear strategy, so nothing gets built on a guess.',
      },
    ],
    cta: {
      heading: 'Find your biggest opportunities.',
      body: "Get a free audit, or book a strategy call and we'll talk through where your business stands today.",
    },
  },
  plan: {
    metaTitle: 'Website & SEO Strategy Planning for Small Businesses',
    metaDescription:
      'We turn audit findings into a clear roadmap: the pages, keywords, content, conversions and backlinks your business needs, with priorities agreed before the build begins.',
    headline: 'Turn insights into a clear roadmap.',
    accent: 'roadmap',
    intro:
      "The Audit tells us where you are. The Plan decides where we're going. We turn the findings into a practical strategy for your website, SEO, content, conversions and backlinks, with clear priorities before the build begins.",
    image: 'process-page-plan',
    imageSize: [1080, 693],
    imageAlt:
      'A laptop showing a digital growth plan with website, keyword, content and backlink strategy cards and a project roadmap, next to a strategy notebook',
    sections: [
      {
        type: 'text',
        eyebrow: 'Why we plan first',
        heading: 'No guessing. No random marketing tasks.',
        body: [
          'We define the pages, keywords, content, authority-building opportunities and project priorities, so every part of the system has a purpose.',
          "Before the work begins, you know what we're building, who we're targeting, why we're targeting it, and what comes next.",
        ],
      },
      {
        type: 'cards',
        eyebrow: 'What we plan',
        heading: 'Website, SEO, content and backlinks, planned as one system.',
        items: [
          {
            title: 'Website strategy',
            body: 'What should the website look like and accomplish? We define the pages, structure, navigation and conversion paths.',
          },
          {
            title: 'Keyword strategy',
            body: 'What should you be found for? We map search intent to your services, pages and content.',
          },
          {
            title: 'Content strategy',
            body: 'What should you publish and why? We plan service pages, location pages and educational content.',
          },
          {
            title: 'Backlink strategy',
            body: 'How will we build authority? We define the authority-building opportunities and their priorities.',
          },
          {
            title: 'Conversion strategy',
            body: 'How will visitors become leads? We plan calls to action, trust elements and enquiry paths.',
          },
          {
            title: 'Project roadmap',
            body: 'What happens first, next and later? We sequence the work into clear phases.',
          },
        ],
      },
      {
        type: 'groups',
        eyebrow: 'Website strategy',
        heading: 'Every important page gets a purpose before design starts.',
        intro:
          'We set the structure before design and development begin. Every important page should attract a searcher, answer a question, build trust, or move a qualified visitor toward an enquiry.',
        groups: [
          {
            title: 'Site architecture',
            items: [
              'Main navigation and page hierarchy',
              'Core service pages',
              'Location or service-area pages where justified',
              'About, proof, FAQ and contact pages',
              'How pages link to each other',
            ],
          },
          {
            title: 'Page strategy',
            items: [
              'The purpose of each page',
              'Who it is for and what they are searching',
              'The main call to action',
              'The supporting information it needs',
              'Links to related pages',
            ],
          },
          {
            title: 'User journey',
            items: [
              'How visitors arrive',
              'What they need to know next',
              'Where trust is established',
              'Where objections are answered',
              'How they reach an enquiry',
            ],
          },
          {
            title: 'Conversion planning',
            items: [
              'Quote and request paths',
              'Phone and contact actions',
              'Trust signals',
              'Where calls to action go',
              'A low-friction enquiry experience',
            ],
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Keyword strategy',
        heading: 'The right searches, connected to the right pages.',
        intro:
          'We plan keywords around search intent and business value, not just search volume. The goal is to connect the right searches to the right pages.',
        note: 'You get a keyword and page map: which page targets which search, which supporting terms belong on it, and where future content opportunities are.',
        items: [
          'Main keywords for your core services',
          'Supporting terms and related topics',
          'Local searches where location affects the purchase',
          'Questions people search that content can answer',
          'One page per search intent, so your pages never compete',
          'Priorities based on relevance, competition, opportunity and business value',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Content strategy',
        heading: 'Content with a job to do.',
        intro: 'Content is planned as part of the growth system, not added randomly after the website is finished.',
        note: 'Every piece of content has a job: rank, educate, build trust, support a service page, or create an enquiry opportunity.',
        items: [
          'Service pages that explain your offer clearly',
          'Location or service-area pages where they add real value',
          'Articles answering real customer questions',
          'Supporting content for your most important services',
          'FAQs based on objections and searches',
          'A publishing schedule your business can keep up',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Backlink strategy',
        heading: 'Authority built on relevance, not volume.',
        intro:
          "The goal isn't to collect as many links as possible. It's to build credible signals that support your business and your market.",
        note: "Backlinks aren't a magic ranking shortcut. They're one part of building authority, working alongside strong pages, relevant content and technical SEO.",
        items: [
          'Review your current backlinks and find weaknesses',
          'Study where relevant competitors get their links',
          'Find industry, local and editorial opportunities',
          'Put quality and relevance ahead of volume',
          'Build local citations where they fit',
          'Create content worth linking to',
          'Track new links and their quality over time',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Conversion strategy',
        heading: 'How visitors become enquiries.',
        intro:
          'A website can attract visitors and still underperform if the next step is unclear or the page does not build enough confidence. The plan sets out how traffic becomes enquiries.',
        items: [
          'The main action for each important page',
          'Calls to action where they make sense in the journey',
          'Trust signals close to decision points',
          'Fewer form fields and less friction',
          'A clear answer to what happens after someone enquires',
          'Softer next steps for visitors not ready to ask for a quote',
        ],
      },
      {
        type: 'process',
        eyebrow: 'Project roadmap',
        heading: 'What happens first, next and later.',
        steps: [
          { title: 'Foundation', body: 'Critical technical and structural issues get fixed, so the work starts on a clean base.' },
          { title: 'Build', body: 'Priority pages and conversion structure, for a website aligned with the strategy.' },
          { title: 'Optimize', body: 'On-page SEO, UX and technical improvements, for a stronger search and user experience.' },
          { title: 'Publish', body: 'Planned content and supporting assets, adding relevance and new ways in from Google.' },
          { title: 'Authority', body: 'Backlinks and local or industry signals, building authority over time.' },
          { title: 'Grow', body: 'Measurement and ongoing improvements, so optimization never stops.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'What you get',
        heading: 'Clear decisions, not a pile of SEO jargon.',
        items: [
          'A recommended page structure for your website',
          'Your priority service and location pages',
          'A keyword and search intent map',
          'Content topics and publishing priorities',
          'Call to action and conversion recommendations',
          'A list of backlink and authority opportunities',
          'A step-by-step project roadmap',
          'Clear next steps for Build & Launch',
        ],
      },
      {
        type: 'note',
        eyebrow: 'How it connects',
        heading: 'Plan is where we decide. Build is where we execute.',
        body: 'Once the strategy is clear, building it is the next logical step. Build & Launch turns the plan into a fast, search-ready, conversion-focused website.',
      },
    ],
    cta: {
      heading: 'Get your growth roadmap.',
      body: "Book a strategy call and we'll talk through what your website, SEO and content should be doing for your business.",
    },
  },
}
