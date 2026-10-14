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
}
