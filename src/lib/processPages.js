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
  'build-and-launch': {
    metaTitle: 'Website Build & Launch for Small Businesses',
    metaDescription:
      'We design, develop, test and launch your website around the plan, with performance, SEO, user experience and conversion built in from the first layout to the final launch check.',
    headline: 'Turn strategy into a high-performing website.',
    accent: 'high-performing website',
    intro:
      'The strategy is ready. Now we build it. We design and develop your website around the plan, with performance, SEO, user experience and conversion built into the process from the beginning.',
    image: 'process-page-build',
    imageSize: [1080, 688],
    imageAlt:
      'A laptop showing a modern business website, beside design, development, SEO, conversion and launch steps and a rocket lifting off',
    sections: [
      {
        type: 'text',
        eyebrow: 'Strategy-led building',
        heading: "We don't just make a website look good.",
        body: [
          'From the first layout to the final launch check, every part of the website has a purpose. We build the pages your customers need, implement the SEO foundation, create clear enquiry paths and test the experience before it goes live.',
          'We build it to perform, communicate your value, support search visibility and make it easy for the right visitor to take action.',
        ],
      },
      {
        type: 'cards',
        eyebrow: 'What we build',
        heading: 'Every part of the build answers one practical question.',
        items: [
          {
            title: 'Design and UX',
            body: 'Will visitors understand and trust the business? We create the visual system and the user experience.',
          },
          {
            title: 'Website development',
            body: 'Will the website be fast, stable and usable? We build the responsive technical foundation.',
          },
          {
            title: 'SEO implementation',
            body: 'Can search engines understand the website? We apply the SEO strategy during the build.',
          },
          {
            title: 'Content implementation',
            body: 'Does each page do its job? We place and structure your approved content.',
          },
          {
            title: 'Conversion setup',
            body: 'Can visitors easily become leads? We build the enquiry paths and calls to action.',
          },
          {
            title: 'Testing and launch',
            body: 'Does everything work, and is the site ready? We check the whole site, then move it live safely.',
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Design and UX',
        heading: 'Design that makes you easier to understand and easier to choose.',
        intro: 'Visual polish matters, but it has to support hierarchy, trust and action. Design follows the strategy, not the other way around.',
        items: [
          'Consistent typography, spacing, imagery and brand',
          'A clear hierarchy, so visitors see what matters first',
          'Layouts designed for desktop, tablet and phone',
          'Services presented so they are easy to understand',
          'Trust elements around important decision points',
          'An accessible, readable and uncluttered interface',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Website development',
        heading: 'Fast, stable and built to grow.',
        intro: 'Development turns the approved design and structure into a working website, built for phones, speed and usability.',
        items: [
          'Works on every modern screen size',
          'Performance-conscious code and page assets',
          'Clean, well-structured page code',
          'Secure forms and sensible technical protections',
          'Reliable navigation, buttons, forms and integrations',
          'Room to add pages and content later without rebuilding',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'SEO implementation',
        heading: 'SEO built in, not bolted on.',
        intro:
          'SEO is implemented while the website is being built. That avoids the common problem of launching first and discovering later that important search fundamentals were missed.',
        items: [
          'Page titles and meta descriptions',
          'Heading hierarchy and page structure',
          'Each page matched to its keywords from the Plan',
          'Internal links between related pages',
          'Optimized images with meaningful alt text',
          'Canonical and indexing settings where needed',
          'XML sitemap and robots configuration',
          'Structured data (schema) where relevant',
          'Search Console and analytics setup where included',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Content implementation',
        heading: 'Content that does its job on every page.',
        intro:
          'Your approved copy is structured around the purpose of each page: easy to scan, with enough detail to answer customer questions and match what people search for.',
        items: [
          "Lead with the customer's problem and the outcome they want",
          'Explain services in plain business language',
          'Headings, short sections and supporting visuals',
          'Proof and trust where they reduce uncertainty',
          'One clear main action on every page',
          'Consistency across service, location and supporting pages',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Conversion setup',
        heading: 'Every important page answers: what should the visitor do next?',
        intro: 'Conversion setup turns the strategy into practical enquiry paths, so qualified visitors always have a clear next step.',
        items: [
          'A main call to action for each important page',
          'Quote and request forms with the right fields',
          'Click-to-call and contact actions where relevant',
          'Trust signals near decision points',
          'Clear expectations about what happens after an enquiry',
          'Softer next steps for visitors still researching',
          'Consistent call to action wording across the site',
        ],
      },
      {
        type: 'groups',
        eyebrow: 'Testing and launch',
        heading: 'We catch problems before your customers do.',
        intro: 'Before launch, the site goes through a structured quality check. Then launch is a controlled, checked transition, not just a button press.',
        groups: [
          {
            title: 'Quality check before launch',
            items: [
              'Desktop, tablet and phone layouts',
              'Navigation and every important link',
              'Forms, confirmation messages and notifications',
              'Call to action buttons and contact methods',
              'Page titles, headings and metadata',
              'Images, alt text and loading behavior',
              'Missing pages, redirects and broken links',
              'Performance and technical checks',
              'Analytics and Search Console tracking',
              'Indexing settings and launch configuration',
            ],
          },
          {
            title: 'Launch sequence',
            items: [
              'Final backup and review before launch',
              'Domain, DNS or hosting setup as needed',
              'SSL and security checks',
              'Moving the site live',
              'Testing pages and forms again once live',
              'Checking search engines can access and index the site',
              'Verifying analytics and tracking',
              'Monitoring the site after launch for unexpected issues',
            ],
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'What you get',
        heading: 'A finished website, ready for customers and search engines.',
        items: [
          'An approved design direction',
          'A responsive website for every screen',
          'Core service and supporting pages',
          'The SEO foundation across priority pages',
          'Enquiry paths, forms and calls to action',
          'Analytics and Search Console setup where included',
          'Testing and quality checks before launch',
          'A checked launch and post-launch verification',
        ],
      },
      {
        type: 'note',
        eyebrow: 'How it connects',
        heading: 'The website is the foundation, not the finish line.',
        body: 'Build & Launch turns the strategy into a fast, search-ready, conversion-focused website. From there, Grow keeps improving your visibility, authority and performance.',
      },
    ],
    cta: {
      heading: 'Start your website project.',
      body: "Book a strategy call and we'll talk through what your new website needs to do for your business.",
    },
  },
  grow: {
    metaTitle: 'Ongoing SEO & Website Growth for Small Businesses',
    metaDescription:
      'After launch, we keep improving your website with ongoing SEO, content, backlinks, performance tracking and conversion improvements, guided by real data.',
    headline: 'Keep improving. Keep getting found.',
    accent: 'Keep getting found',
    intro:
      'Launching your website is only the beginning. We keep working on the system with ongoing SEO, content, backlinks, performance tracking and conversion improvements, so your online presence can become stronger over time.',
    image: 'process-page-grow',
    imageSize: [1080, 1018],
    imageAlt:
      'A laptop showing a rising growth chart, beside SEO growth, backlink building, content growth, performance tracking and continuous optimization steps',
    sections: [
      {
        type: 'text',
        eyebrow: 'Why growth never stops',
        heading: "We don't disappear after launch.",
        body: [
          'We use performance data to find opportunities, prioritize the next improvements and keep your website moving forward.',
          'Launch is not the finish line. SEO is an ongoing process, not a one-time installation, so we keep improving the system to make it more visible, more competitive and better at generating enquiries.',
        ],
      },
      {
        type: 'cards',
        eyebrow: 'What we keep improving',
        heading: 'Every part of growth answers one practical question.',
        items: [
          {
            title: 'SEO growth',
            body: 'How do we keep improving search visibility? We build on what the search data shows.',
          },
          {
            title: 'Backlink building',
            body: "How do we strengthen the site's authority? We build relevant authority over time.",
          },
          {
            title: 'Content growth',
            body: 'How do we create new opportunities? We publish useful content that reaches more searches.',
          },
          {
            title: 'Performance tracking',
            body: 'What is happening, and what does the data tell us? We measure visibility, traffic and enquiries.',
          },
          {
            title: 'Conversion optimization',
            body: 'How do we get more from existing traffic? We help more visitors take action.',
          },
          {
            title: 'Continuous optimization',
            body: 'What should we improve next? We turn each insight into the next improvement.',
          },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'SEO growth',
        heading: 'Informed improvements, not constant changes.',
        intro:
          "Ongoing SEO focuses on the opportunities real performance data reveals. The goal isn't to change things constantly; it's to make informed improvements that strengthen your search visibility.",
        items: [
          'Monitor priority keywords and search visibility',
          'Spot pages gaining traction and pages that need work',
          'Refresh or expand key service pages when the data supports it',
          'Improve internal linking as the site grows',
          'Fix new technical SEO issues as they appear',
          'Find new service, location and question-based searches',
          'Let Search Console and analytics data guide priorities',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Backlink building',
        heading: 'Authority that is deliberate, relevant and sustainable.',
        intro:
          "We earn quality signals that support your topical and local authority, rather than chasing link volume for its own sake.",
        items: [
          'Research relevant industry and local opportunities',
          'Find competitor link gaps and useful referring sites',
          'Build relationships and placements where they fit',
          'Create resources worth linking to when useful',
          'Strengthen local citations and business listings',
          'Review the quality and relevance of new links',
          'Track authority-building progress over time',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Content growth',
        heading: 'More useful ways for customers to find you.',
        intro: 'Content growth is tied to what people search for, your services and real customer questions.',
        items: [
          'New articles answering relevant questions',
          'Supporting content for priority service pages',
          'Location or service-area content where it adds real value',
          'FAQs and problem-solving resources',
          'Refreshing pages that have lost relevance or momentum',
          'Better links between related topics',
          'Ideas drawn from searches, competitors and customer questions',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Performance tracking',
        heading: 'Measurement that leads to better decisions.',
        intro:
          "The point of tracking isn't impressive dashboards. It's understanding what is changing so we can make better decisions.",
        note: 'No single number proves success. Rankings, traffic, enquiries and authority are read together, against your actual business goals.',
        items: [
          'Search visibility and priority keyword movement',
          'Organic traffic and landing page performance',
          'Search impressions and click-through rates',
          'Enquiries and conversion trends',
          'Top-performing and underperforming pages',
          'New backlinks and referring sites',
          'Technical health and notable site issues',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Conversion optimization',
        heading: 'More value from the visitors you already have.',
        intro:
          "More traffic isn't automatically better if the website doesn't turn qualified visitors into enquiries. So growth includes improving the experience after visitors arrive.",
        items: [
          'Call to action placement and clarity',
          'Landing page messaging and relevance',
          'Forms and enquiry friction',
          'Trust signals and proof',
          'The enquiry experience on phones',
          'Clear service pages',
          'Testing and improving key enquiry paths',
        ],
      },
      {
        type: 'process',
        eyebrow: 'The growth loop',
        heading: 'A repeating cycle, not a list of disconnected tasks.',
        steps: [
          { title: 'Measure', body: 'Review performance and search data, to understand what changed.' },
          { title: 'Diagnose', body: 'Find the reason behind the change, so nothing is a guess.' },
          { title: 'Prioritize', body: 'Choose the highest-value opportunity, to focus the effort.' },
          { title: 'Improve', body: 'Make the chosen change, aiming for a measurable improvement.' },
          { title: 'Monitor', body: 'Give the change time to show evidence, then evaluate its impact.' },
          { title: 'Repeat', body: 'Feed what we learned into the next cycle, so progress compounds.' },
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'Reporting',
        heading: "Reports that explain what happened and what's next.",
        intro:
          'Reporting should help you understand what happened, why it matters, what we changed and what we recommend next. A regular report can include:',
        items: [
          'Key visibility and traffic changes',
          'Important ranking and search developments',
          'Pages and content improved or created',
          'Authority and backlink activity',
          'Enquiry observations where data is available',
          'Technical issues addressed',
          'Next priorities and recommended actions',
        ],
      },
      {
        type: 'checklist',
        eyebrow: 'What you get',
        heading: 'A clear system of measuring, prioritizing and improving.',
        items: [
          'Ongoing SEO recommendations and implementation',
          'Monitoring of priority keywords and pages',
          'Content opportunities and planned updates',
          'Backlink and authority-building activity',
          'Performance monitoring and reporting',
          'Conversion improvement recommendations',
          'Technical and on-page optimization as needed',
          'A prioritized list of next growth opportunities',
        ],
      },
      {
        type: 'note',
        eyebrow: 'How it connects',
        heading: 'Audit. Plan. Build. Grow. Then keep going.',
        body: 'Audit understands, Plan decides, Build & Launch executes and Grow compounds. Your original Audit and Plan become the baseline, so you can see progress over time, and every growth cycle starts from what the last one taught us.',
      },
    ],
    cta: {
      heading: 'Keep your website growing.',
      body: "Book a strategy call and we'll talk through where your website can grow next.",
    },
  },
}
