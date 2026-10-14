// Client project checklist, used by the client progress pages (/progress/<id>)
// and Lino's editor (/clients). Generated from the 'LinoCon Digital Client
// Project Checklist' PDF so the app and the printed checklist match.
// Every item has a fixed id: ticks are saved against it, so keep ids
// unchanged when rewording an item, and give new items new ids.

export const AUDIT = [
  {
    id: 'audit.discovery-and-access',
    title: 'Discovery & access',
    sub: 'We learn about the business before judging the website.',
    items: [
      {
        id: 'audit.discovery-and-access.1',
        text: 'Kickoff call: business, services, ideal customers, service area and goals'
      },
      {
        id: 'audit.discovery-and-access.2',
        text: "Note the client's top 3 goals for the project (in their words)"
      },
      {
        id: 'audit.discovery-and-access.3',
        text: 'Access: website / CMS / hosting and domain (DNS)'
      },
      {
        id: 'audit.discovery-and-access.4',
        text: 'Access: Google Analytics (GA4) and Google Search Console'
      },
      {
        id: 'audit.discovery-and-access.5',
        text: 'Access: Google Business Profile and other listings (Bing, Apple, directories)'
      },
      {
        id: 'audit.discovery-and-access.6',
        text: "List the client's main competitors and the searches they care about"
      }
    ]
  },
  {
    id: 'audit.website-audit',
    title: 'Website audit',
    sub: 'Does the site make it easy to understand, trust and contact the business?',
    items: [
      {
        id: 'audit.website-audit.1',
        text: 'Page speed and Core Web Vitals signals (desktop and mobile)'
      },
      {
        id: 'audit.website-audit.2',
        text: 'Mobile responsiveness and usability'
      },
      {
        id: 'audit.website-audit.3',
        text: 'Broken links, errors and indexing issues; HTTPS and basic security'
      },
      {
        id: 'audit.website-audit.4',
        text: 'Image sizes, formats and unnecessary page weight'
      },
      {
        id: 'audit.website-audit.5',
        text: 'Navigation clarity, page hierarchy and how easy services are to find'
      },
      {
        id: 'audit.website-audit.6',
        text: 'First screen explains what the business does and who it serves'
      },
      {
        id: 'audit.website-audit.7',
        text: 'Value proposition is specific; services explained in customer language'
      },
      {
        id: 'audit.website-audit.8',
        text: 'Proof present: reviews, projects, credentials, guarantees, experience'
      },
      {
        id: 'audit.website-audit.9',
        text: 'Common objections answered on the site'
      }
    ]
  },
  {
    id: 'audit.seo-audit',
    title: 'SEO audit',
    sub: 'Can Google understand the business and rank the right pages?',
    items: [
      {
        id: 'audit.seo-audit.1',
        text: 'Indexability, crawlability, XML sitemap and robots directives'
      },
      {
        id: 'audit.seo-audit.2',
        text: 'Canonicals, duplicate content, status codes and redirects'
      },
      {
        id: 'audit.seo-audit.3',
        text: 'Structured data / schema opportunities'
      },
      {
        id: 'audit.seo-audit.4',
        text: 'Title tags, meta descriptions and heading hierarchy'
      },
      {
        id: 'audit.seo-audit.5',
        text: 'Primary and supporting keyword alignment per page; internal linking'
      },
      {
        id: 'audit.seo-audit.6',
        text: 'Image alt text and contextual relevance'
      },
      {
        id: 'audit.seo-audit.7',
        text: 'Pages match real search intent; service-page depth'
      },
      {
        id: 'audit.seo-audit.8',
        text: 'Location / service-area opportunities and content gaps vs competitors'
      },
      {
        id: 'audit.seo-audit.9',
        text: 'Backlink profile, referring domains and link quality'
      }
    ]
  },
  {
    id: 'audit.competitor-analysis',
    title: 'Competitor analysis',
    sub: 'Only the competitors that matter in this market.',
    items: [
      {
        id: 'audit.competitor-analysis.1',
        text: 'Who appears in the relevant Google searches'
      },
      {
        id: 'audit.competitor-analysis.2',
        text: 'Which services and pages competitors emphasize; how their sites are structured'
      },
      {
        id: 'audit.competitor-analysis.3',
        text: 'Their content strength, local signals and backlink authority'
      },
      {
        id: 'audit.competitor-analysis.4',
        text: 'Gaps the client can realistically win (Competitive Opportunity Map)'
      }
    ]
  },
  {
    id: 'audit.conversion-audit',
    title: 'Conversion audit',
    sub: 'Is traffic being turned into enquiries?',
    items: [
      {
        id: 'audit.conversion-audit.1',
        text: 'CTA visibility, placement and consistency across key pages'
      },
      {
        id: 'audit.conversion-audit.2',
        text: 'Quote / contact form friction'
      },
      {
        id: 'audit.conversion-audit.3',
        text: 'Phone, email and other enquiry options'
      },
      {
        id: 'audit.conversion-audit.4',
        text: 'Visitor knows what happens after they submit an enquiry'
      }
    ]
  },
  {
    id: 'audit.local-presence-audit',
    title: 'Local presence audit',
    sub: 'Can nearby customers find and trust the business?',
    items: [
      {
        id: 'audit.local-presence-audit.1',
        text: 'Google Business Profile presence and completeness'
      },
      {
        id: 'audit.local-presence-audit.2',
        text: 'Name, address / service area and phone consistent everywhere (NAP)'
      },
      {
        id: 'audit.local-presence-audit.3',
        text: 'Reviews and review-generation opportunities'
      },
      {
        id: 'audit.local-presence-audit.4',
        text: 'Local landing pages, citations, directories and local backlinks'
      },
      {
        id: 'audit.local-presence-audit.5',
        text: 'Website matches external business profiles'
      }
    ]
  },
  {
    id: 'audit.opportunity-report',
    title: 'Opportunity report',
    sub: 'Turn findings into a prioritized list, not a long report.',
    items: [
      {
        id: 'audit.opportunity-report.1',
        text: 'Sort every finding: 1 Critical / 2 High Impact / 3 Growth / 4 Optimization'
      },
      {
        id: 'audit.opportunity-report.2',
        text: "Record today's numbers as the BASELINE (traffic, rankings, enquiries, reviews)"
      },
      {
        id: 'audit.opportunity-report.3',
        text: "Write: what's holding the business back right now"
      },
      {
        id: 'audit.opportunity-report.4',
        text: 'Write: which opportunities are worth pursuing'
      },
      {
        id: 'audit.opportunity-report.5',
        text: 'Write: what we recommend next, and why'
      },
      {
        id: 'audit.opportunity-report.6',
        text: 'Walk the client through the findings'
      }
    ]
  }
]

export const PLAN = [
  {
    id: 'plan.website-strategy',
    title: 'Website strategy',
    sub: 'Architecture before design. Every page has a job.',
    items: [
      {
        id: 'plan.website-strategy.1',
        text: 'Primary navigation and page hierarchy'
      },
      {
        id: 'plan.website-strategy.2',
        text: 'Core service pages and location / service-area pages (where justified)'
      },
      {
        id: 'plan.website-strategy.3',
        text: 'About, proof, FAQ and contact structure'
      },
      {
        id: 'plan.website-strategy.4',
        text: 'For each page: purpose, audience, search intent, primary CTA'
      },
      {
        id: 'plan.website-strategy.5',
        text: 'User journey: how visitors arrive, where trust is built, how they enquire'
      },
      {
        id: 'plan.website-strategy.6',
        text: 'Internal-linking relationships between pages'
      }
    ]
  },
  {
    id: 'plan.keyword-strategy',
    title: 'Keyword strategy',
    sub: 'Intent and business value, not just search volume.',
    items: [
      {
        id: 'plan.keyword-strategy.1',
        text: 'Primary commercial keywords for each core service'
      },
      {
        id: 'plan.keyword-strategy.2',
        text: 'Supporting terms, related topics and local search terms'
      },
      {
        id: 'plan.keyword-strategy.3',
        text: 'Informational searches that can feed future content'
      },
      {
        id: 'plan.keyword-strategy.4',
        text: 'Keyword & Page Map: one primary intent per page (no competing pages)'
      },
      {
        id: 'plan.keyword-strategy.5',
        text: 'Priorities set by relevance, competition, opportunity and value'
      }
    ]
  },
  {
    id: 'plan.content-strategy',
    title: 'Content strategy',
    sub: 'Every piece of content has a job.',
    items: [
      {
        id: 'plan.content-strategy.1',
        text: 'Service page content needed (explain the offer clearly)'
      },
      {
        id: 'plan.content-strategy.2',
        text: 'Location / service-area pages that add genuine value'
      },
      {
        id: 'plan.content-strategy.3',
        text: 'Article topics answering real customer questions'
      },
      {
        id: 'plan.content-strategy.4',
        text: 'FAQ opportunities from objections and search intent'
      },
      {
        id: 'plan.content-strategy.5',
        text: 'Publishing schedule the business can actually sustain'
      }
    ]
  },
  {
    id: 'plan.backlink-strategy',
    title: 'Backlink strategy',
    sub: 'Authority as one part of the system, not a shortcut.',
    items: [
      {
        id: 'plan.backlink-strategy.1',
        text: 'Weaknesses in the current backlink profile'
      },
      {
        id: 'plan.backlink-strategy.2',
        text: 'Relevant competitor link sources'
      },
      {
        id: 'plan.backlink-strategy.3',
        text: 'Industry, local and editorial opportunities (quality over volume)'
      },
      {
        id: 'plan.backlink-strategy.4',
        text: 'Local citations to build; link-worthy assets worth creating'
      }
    ]
  },
  {
    id: 'plan.conversion-strategy',
    title: 'Conversion strategy',
    sub: 'How visitors become leads.',
    items: [
      {
        id: 'plan.conversion-strategy.1',
        text: 'Primary conversion defined for each important page'
      },
      {
        id: 'plan.conversion-strategy.2',
        text: 'CTA placement along the visitor journey'
      },
      {
        id: 'plan.conversion-strategy.3',
        text: 'Trust signals near decision points'
      },
      {
        id: 'plan.conversion-strategy.4',
        text: "Fewer form fields; clear 'what happens next' after enquiry"
      },
      {
        id: 'plan.conversion-strategy.5',
        text: 'Secondary actions for visitors not ready to request a quote'
      }
    ]
  },
  {
    id: 'plan.project-roadmap-and-approval',
    title: 'Project roadmap & approval',
    sub: 'What happens first, next and later.',
    items: [
      {
        id: 'plan.project-roadmap-and-approval.1',
        text: 'Phase 1 Foundation: critical technical and structural fixes'
      },
      {
        id: 'plan.project-roadmap-and-approval.2',
        text: 'Phase 2 Build: priority pages and conversion structure'
      },
      {
        id: 'plan.project-roadmap-and-approval.3',
        text: 'Phase 3 Optimize: on-page SEO, UX and technical improvements'
      },
      {
        id: 'plan.project-roadmap-and-approval.4',
        text: 'Phase 4 Publish: planned content and supporting assets'
      },
      {
        id: 'plan.project-roadmap-and-approval.5',
        text: 'Phase 5 Authority: backlinks and local / industry signals'
      },
      {
        id: 'plan.project-roadmap-and-approval.6',
        text: 'Phase 6 Grow: measurement and ongoing improvement'
      },
      {
        id: 'plan.project-roadmap-and-approval.7',
        text: 'Agree how success will be measured (against the Audit baseline)'
      },
      {
        id: 'plan.project-roadmap-and-approval.8',
        text: 'Client approves the plan before the build starts'
      }
    ]
  }
]

export const BUILD = [
  {
    id: 'build.design-and-ux',
    title: 'Design & UX',
    sub: 'Design follows the strategy.',
    items: [
      {
        id: 'build.design-and-ux.1',
        text: 'Brand consistency: typography, spacing, imagery, visual language'
      },
      {
        id: 'build.design-and-ux.2',
        text: 'Clear hierarchy so visitors know what matters first'
      },
      {
        id: 'build.design-and-ux.3',
        text: 'Layouts for desktop, tablet and mobile'
      },
      {
        id: 'build.design-and-ux.4',
        text: 'Trust elements placed near decision points'
      },
      {
        id: 'build.design-and-ux.5',
        text: 'Accessible, readable, uncluttered interface'
      },
      {
        id: 'build.design-and-ux.6',
        text: 'Client approves the design direction'
      }
    ]
  },
  {
    id: 'build.website-development',
    title: 'Website development',
    sub: 'Fast, stable and usable.',
    items: [
      {
        id: 'build.website-development.1',
        text: 'Responsive build across modern screen sizes'
      },
      {
        id: 'build.website-development.2',
        text: 'Performance-conscious code and optimized assets'
      },
      {
        id: 'build.website-development.3',
        text: 'Clean, semantic page structure'
      },
      {
        id: 'build.website-development.4',
        text: 'Secure forms and technical protections'
      },
      {
        id: 'build.website-development.5',
        text: 'Navigation, buttons, forms and integrations all reliable'
      },
      {
        id: 'build.website-development.6',
        text: 'Structure can grow without a rebuild'
      }
    ]
  },
  {
    id: 'build.seo-implementation',
    title: 'SEO implementation',
    sub: 'Built in during the build, not bolted on after.',
    items: [
      {
        id: 'build.seo-implementation.1',
        text: 'Page titles and meta descriptions on every page'
      },
      {
        id: 'build.seo-implementation.2',
        text: 'Heading hierarchy and keyword-to-page alignment from the Plan'
      },
      {
        id: 'build.seo-implementation.3',
        text: 'Internal links between related pages'
      },
      {
        id: 'build.seo-implementation.4',
        text: 'Image optimization and meaningful alt text'
      },
      {
        id: 'build.seo-implementation.5',
        text: 'Canonicals and indexing settings'
      },
      {
        id: 'build.seo-implementation.6',
        text: 'XML sitemap and robots configuration'
      },
      {
        id: 'build.seo-implementation.7',
        text: 'Structured data / schema where relevant'
      },
      {
        id: 'build.seo-implementation.8',
        text: 'Search Console and analytics set up or verified'
      }
    ]
  },
  {
    id: 'build.content-and-conversion-setup',
    title: 'Content & conversion setup',
    sub: 'Every important page answers: what should the visitor do next?',
    items: [
      {
        id: 'build.content-and-conversion-setup.1',
        text: "Approved copy placed: leads with the customer's problem and outcome"
      },
      {
        id: 'build.content-and-conversion-setup.2',
        text: 'Headings, short sections and supporting visuals; one primary action per page'
      },
      {
        id: 'build.content-and-conversion-setup.3',
        text: 'Primary CTA on each important page; consistent CTA wording'
      },
      {
        id: 'build.content-and-conversion-setup.4',
        text: 'Quote / request forms with the right fields'
      },
      {
        id: 'build.content-and-conversion-setup.5',
        text: 'Click-to-call and contact actions'
      },
      {
        id: 'build.content-and-conversion-setup.6',
        text: 'Clear expectations about what happens after an enquiry'
      },
      {
        id: 'build.content-and-conversion-setup.7',
        text: 'Lead / enquiry tracking set up in analytics'
      }
    ]
  },
  {
    id: 'build.testing-and-qa',
    title: 'Testing & QA',
    sub: 'Catch problems before customers do.',
    items: [
      {
        id: 'build.testing-and-qa.1',
        text: 'Desktop, tablet and mobile layouts checked'
      },
      {
        id: 'build.testing-and-qa.2',
        text: 'Navigation and all important links'
      },
      {
        id: 'build.testing-and-qa.3',
        text: 'Forms, confirmation messages and notifications (send a real test)'
      },
      {
        id: 'build.testing-and-qa.4',
        text: 'CTA buttons and contact methods'
      },
      {
        id: 'build.testing-and-qa.5',
        text: 'Page titles, headings, metadata, images and alt text'
      },
      {
        id: 'build.testing-and-qa.6',
        text: '404s, redirects and broken links'
      },
      {
        id: 'build.testing-and-qa.7',
        text: 'Performance and basic technical checks'
      },
      {
        id: 'build.testing-and-qa.8',
        text: 'Analytics, Search Console tracking and indexing settings'
      }
    ]
  },
  {
    id: 'build.launch',
    title: 'Launch',
    sub: 'A controlled transition, not just a button press.',
    items: [
      {
        id: 'build.launch.1',
        text: 'Final pre-launch backup and review'
      },
      {
        id: 'build.launch.2',
        text: 'Domain / DNS and hosting configured'
      },
      {
        id: 'build.launch.3',
        text: 'SSL / security verified'
      },
      {
        id: 'build.launch.4',
        text: 'Production deployment'
      },
      {
        id: 'build.launch.5',
        text: 'Post-launch test of every page and form'
      },
      {
        id: 'build.launch.6',
        text: 'Sitemap submitted; search-engine access and indexing checked'
      },
      {
        id: 'build.launch.7',
        text: 'Analytics and tracking verified on the live site'
      },
      {
        id: 'build.launch.8',
        text: 'Monitor for unexpected issues in the days after launch'
      },
      {
        id: 'build.launch.9',
        text: 'Client sign-off and handover into Grow'
      }
    ]
  }
]

export const GROW_SETUP = [
  {
    id: 'grow.setup.1',
    text: 'Audit baseline numbers saved where the client can see progress against them'
  },
  {
    id: 'grow.setup.2',
    text: 'Agree the monthly report date and who receives it'
  },
  {
    id: 'grow.setup.3',
    text: 'Priority keywords and priority pages listed for monitoring'
  },
  {
    id: 'grow.setup.4',
    text: 'Search Console, GA4 and lead tracking confirmed working'
  },
  {
    id: 'grow.setup.5',
    text: 'Content calendar for the first quarter agreed'
  },
  {
    id: 'grow.setup.6',
    text: 'Backlink / citation target list ready (from the Plan)'
  },
  {
    id: 'grow.setup.7',
    text: 'Client knows: no guaranteed rankings, growth is measured and improved over time'
  }
]

export const GROW_MONTHLY = [
  {
    id: 'month.measure',
    title: 'Measure',
    items: [
      {
        id: 'month.measure.1',
        text: 'Review Search Console: impressions, clicks, CTR, queries'
      },
      {
        id: 'month.measure.2',
        text: 'Review GA4: organic traffic and landing-page performance'
      },
      {
        id: 'month.measure.3',
        text: 'Check enquiries / leads and conversion trend'
      },
      {
        id: 'month.measure.4',
        text: 'Check priority keyword movement'
      },
      {
        id: 'month.measure.5',
        text: 'Technical health check (errors, speed, indexing)'
      }
    ]
  },
  {
    id: 'month.diagnose-and-prioritize',
    title: 'Diagnose & prioritize',
    items: [
      {
        id: 'month.diagnose-and-prioritize.1',
        text: 'Find the reason behind the biggest change (up or down)'
      },
      {
        id: 'month.diagnose-and-prioritize.2',
        text: 'Spot pages gaining traction and pages that need work'
      },
      {
        id: 'month.diagnose-and-prioritize.3',
        text: "Pick the month's highest-value opportunity"
      }
    ]
  },
  {
    id: 'month.improve-seo-and-content',
    title: 'Improve: SEO & content',
    items: [
      {
        id: 'month.improve-seo-and-content.1',
        text: 'Publish planned article(s) / supporting content'
      },
      {
        id: 'month.improve-seo-and-content.2',
        text: 'Refresh or expand a priority page when data supports it'
      },
      {
        id: 'month.improve-seo-and-content.3',
        text: 'Improve internal links to new and priority pages'
      },
      {
        id: 'month.improve-seo-and-content.4',
        text: 'Fix technical SEO issues found'
      }
    ]
  },
  {
    id: 'month.improve-authority',
    title: 'Improve: authority',
    items: [
      {
        id: 'month.improve-authority.1',
        text: 'Pursue relevant backlink / placement opportunities'
      },
      {
        id: 'month.improve-authority.2',
        text: 'Add or clean up local citations and listings'
      },
      {
        id: 'month.improve-authority.3',
        text: 'Google Business Profile: post, photos, answer reviews'
      },
      {
        id: 'month.improve-authority.4',
        text: 'Ask happy clients for reviews'
      }
    ]
  },
  {
    id: 'month.improve-conversion',
    title: 'Improve: conversion',
    items: [
      {
        id: 'month.improve-conversion.1',
        text: 'Review one conversion path (CTA, form, trust, mobile)'
      },
      {
        id: 'month.improve-conversion.2',
        text: 'Make one tested conversion improvement'
      }
    ]
  },
  {
    id: 'month.report-and-repeat',
    title: 'Report & repeat',
    items: [
      {
        id: 'month.report-and-repeat.1',
        text: 'Send the monthly report (see outline below)'
      },
      {
        id: 'month.report-and-repeat.2',
        text: 'Log what changed and the next priority in the Growth Log'
      }
    ]
  }
]

export const GROW_QUARTERLY = [
  {
    id: 'quarter.compare-to-baseline',
    title: 'Compare to baseline',
    items: [
      {
        id: 'quarter.compare-to-baseline.1',
        text: 'Compare this quarter to the Audit baseline and last quarter'
      },
      {
        id: 'quarter.compare-to-baseline.2',
        text: 'Read rankings, traffic, enquiries and authority together, not one metric alone'
      },
      {
        id: 'quarter.compare-to-baseline.3',
        text: "Review results against the client's actual business goals"
      }
    ]
  },
  {
    id: 'quarter.refresh-the-strategy',
    title: 'Refresh the strategy',
    items: [
      {
        id: 'quarter.refresh-the-strategy.1',
        text: 'Update the Keyword & Page Map with new opportunities'
      },
      {
        id: 'quarter.refresh-the-strategy.2',
        text: "Plan next quarter's content calendar"
      },
      {
        id: 'quarter.refresh-the-strategy.3',
        text: 'Re-check top competitors: new pages, content, links'
      },
      {
        id: 'quarter.refresh-the-strategy.4',
        text: 'Re-check local presence: profile, reviews, citations, NAP'
      },
      {
        id: 'quarter.refresh-the-strategy.5',
        text: 'Find new service, location or informational search opportunities'
      }
    ]
  },
  {
    id: 'quarter.deeper-checks',
    title: 'Deeper checks',
    items: [
      {
        id: 'quarter.deeper-checks.1',
        text: 'Full technical SEO crawl (status codes, redirects, duplicates)'
      },
      {
        id: 'quarter.deeper-checks.2',
        text: 'Backlink quality review: referring-domain trend, bad links'
      },
      {
        id: 'quarter.deeper-checks.3',
        text: 'Content refresh list: pages that lost relevance or momentum'
      },
      {
        id: 'quarter.deeper-checks.4',
        text: 'Full conversion-path review on mobile and desktop'
      }
    ]
  },
  {
    id: 'quarter.client-review',
    title: 'Client review',
    items: [
      {
        id: 'quarter.client-review.1',
        text: 'Quarterly review meeting with the client'
      },
      {
        id: 'quarter.client-review.2',
        text: 'Agree the top priorities for next quarter'
      },
      {
        id: 'quarter.client-review.3',
        text: 'Confirm goals, services or budget changes'
      }
    ]
  }
]

export const REPORT_OUTLINE = [
  'Key visibility and traffic changes',
  'Important ranking or search-intent developments',
  'Pages and content improved or created',
  'Authority / backlink activity',
  'Enquiry and conversion observations (where data is available)',
  'Technical issues addressed',
  'Next priorities and recommended actions'
]


// What the client already has, filled in at the kickoff call. Each item is
// marked "Have", "Don't have" or "Not sure", with an optional note (for
// example where the domain is registered). Never store passwords here.
export const INTAKE = [
  {
    id: 'has.domain-and-hosting',
    title: 'Domain & hosting',
    items: [
      { id: 'has.domain-and-hosting.domain-name', text: 'Domain name', hint: "Domain + where it's registered (GoDaddy, Namecheap...)" },
      { id: 'has.domain-and-hosting.login-to-the-domain-account', text: 'Login to the domain account', hint: 'Who owns the login?' },
      { id: 'has.domain-and-hosting.website-hosting', text: 'Website hosting', hint: 'Host and plan' },
      { id: 'has.domain-and-hosting.business-email-on-the-domain', text: 'Business email on the domain', hint: 'e.g. info@business.ca' },
    ],
  },
  {
    id: 'has.current-website',
    title: 'Current website',
    items: [
      { id: 'has.current-website.existing-website', text: 'Existing website', hint: 'Address, and is it still live?' },
      { id: 'has.current-website.website-cms-admin-login', text: 'Website / CMS admin login', hint: 'WordPress, Wix, Squarespace, other' },
      { id: 'has.current-website.recent-backup-of-the-site', text: 'Recent backup of the site' },
      { id: 'has.current-website.contact-or-quote-form', text: 'Contact or quote form', hint: 'Where do enquiries go now?' },
    ],
  },
  {
    id: 'has.google-and-tracking',
    title: 'Google & tracking',
    items: [
      { id: 'has.google-and-tracking.google-account-for-the-business', text: 'Google account for the business', hint: 'Which email?' },
      { id: 'has.google-and-tracking.google-business-profile', text: 'Google Business Profile', hint: 'Verified? Who manages it?' },
      { id: 'has.google-and-tracking.google-analytics', text: 'Google Analytics' },
      { id: 'has.google-and-tracking.google-search-console', text: 'Google Search Console' },
      { id: 'has.google-and-tracking.bing-places-apple-business-connect', text: 'Bing Places / Apple Business Connect' },
    ],
  },
  {
    id: 'has.brand-and-content',
    title: 'Brand & content',
    items: [
      { id: 'has.brand-and-content.logo-files-high-quality', text: 'Logo files (high quality)', hint: 'SVG / PNG / AI' },
      { id: 'has.brand-and-content.brand-colours-and-fonts', text: 'Brand colours and fonts' },
      { id: 'has.brand-and-content.photos-of-work-team-or-location', text: 'Photos of work, team or location', hint: 'Own photos or stock?' },
      { id: 'has.brand-and-content.written-content-services-about-faq', text: 'Written content (services, about, FAQ)' },
      { id: 'has.brand-and-content.customer-reviews-testimonials', text: 'Customer reviews / testimonials', hint: 'Real ones only, with permission' },
    ],
  },
  {
    id: 'has.social-and-listings',
    title: 'Social & listings',
    items: [
      { id: 'has.social-and-listings.facebook-page', text: 'Facebook page' },
      { id: 'has.social-and-listings.instagram', text: 'Instagram' },
      { id: 'has.social-and-listings.linkedin-other-social', text: 'LinkedIn / other social' },
      { id: 'has.social-and-listings.directory-listings-yelp-bbb-industry', text: 'Directory listings (Yelp, BBB, industry)' },
    ],
  },
  {
    id: 'has.leads-and-tools',
    title: 'Leads & tools',
    items: [
      { id: 'has.leads-and-tools.business-phone-number', text: 'Business phone number', hint: 'Click-to-call ready?' },
      { id: 'has.leads-and-tools.booking-calendar-tool', text: 'Booking / calendar tool' },
      { id: 'has.leads-and-tools.crm-or-lead-list', text: 'CRM or lead list' },
      { id: 'has.leads-and-tools.who-answers-new-enquiries', text: 'Who answers new enquiries', hint: 'Name and how fast' },
    ],
  },
]
