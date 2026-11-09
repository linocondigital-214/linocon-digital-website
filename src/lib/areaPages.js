// City pages (/web-design-<city>) for local Google searches like
// "web design Burnaby". Each city has its own wording, not the same text with
// the name swapped, because Google ignores near-copies. Keep facts general and
// true: no fake addresses, reviews or numbers. The footer, the Who we work
// with page, the routes in App.jsx and the schema in entry-server.jsx all read
// from this list. Add each new city to public/sitemap.xml too.
export const AREAS = [
  {
    slug: 'web-design-vancouver',
    city: 'Vancouver',
    metaTitle: 'Website Design & SEO in Vancouver, BC',
    metaDescription:
      'Website design and SEO for small businesses in Vancouver, BC. LinoCon Digital is based in Vancouver and builds fast, mobile-friendly websites that help local customers find you on Google.',
    headline: 'Website design and SEO for small businesses in Vancouver.',
    accent: 'Vancouver',
    intro:
      'LinoCon Digital is based right here in Vancouver, BC. We build fast, mobile-friendly websites and set up the SEO that helps people in your neighbourhood find you on Google.',
    local: {
      heading: 'Vancouver is a busy place to stand out online.',
      body: [
        'From Kitsilano and Mount Pleasant to Commercial Drive and the West End, Vancouver has a lot of small businesses competing for the same searches. When someone types “near me” into Google, the businesses with a clear website and a complete Google Business Profile are the ones that get the call.',
        'We set up your website so Google knows exactly what you do and which parts of Vancouver you serve, whether you have a shop customers walk into or you travel to them.',
      ],
    },
    who: [
      'Cafés, restaurants and food businesses',
      'Trades and home services',
      'Salons, studios and wellness businesses',
      'Clinics and health practices',
      'Shops and local retailers',
      'Consultants and professional services',
    ],
    faq: [
      {
        title: 'Are you actually based in Vancouver?',
        body: 'Yes. LinoCon Digital is a Vancouver, BC business. Most of the work happens online, so calls and approvals fit around your day.',
      },
      {
        title: 'Can you help me show up for my neighbourhood?',
        body: 'Yes. We look at the area you serve and the words local customers search for, then set up your pages and Google Business Profile to match.',
      },
      {
        title: 'I already have a website. Can you fix it instead?',
        body: 'Often, yes. Start with a free website audit and we’ll tell you honestly whether it needs SEO fixes or a new build.',
      },
    ],
  },
  {
    slug: 'web-design-burnaby',
    city: 'Burnaby',
    metaTitle: 'Website Design & SEO in Burnaby, BC',
    metaDescription:
      'Website design and SEO for small businesses in Burnaby, BC. Fast, mobile-friendly websites and local SEO from LinoCon Digital, right next door in Vancouver.',
    headline: 'Website design and SEO for small businesses in Burnaby.',
    accent: 'Burnaby',
    intro:
      'We’re right next door in Vancouver and work with Burnaby businesses that want more customers from Google. You get a fast website, local SEO and one team that looks after both.',
    local: {
      heading: 'Get found across Burnaby, not just on your street.',
      body: [
        'Burnaby customers search by area: Metrotown, Brentwood, Edmonds, North Burnaby, Lougheed. If your website doesn’t say where you work, Google has to guess, and it often shows a business in Vancouver or Coquitlam instead.',
        'We make it clear which parts of Burnaby you serve, so you appear when people nearby search for what you do. That includes your website, your Google Business Profile and the details that keep them consistent.',
      ],
    },
    who: [
      'Shops and restaurants near Metrotown and Brentwood',
      'Trades, contractors and home services',
      'Auto, repair and service businesses',
      'Clinics, dentists and health practices',
      'Tutors, studios and family services',
      'New businesses that need their first website',
    ],
    faq: [
      {
        title: 'Do you work with businesses outside Vancouver?',
        body: 'Yes. Burnaby is next door, and everything from the first call to final approval can happen online.',
      },
      {
        title: 'My customers come from Burnaby and nearby cities. Is that a problem?',
        body: 'Not at all. We set up your website to show the main area you serve and the nearby areas you also cover.',
      },
      {
        title: 'How do I get started?',
        body: 'Ask for a free website audit or book a strategy call. We’ll look at where you show up today and what would help most.',
      },
    ],
  },
  {
    slug: 'web-design-surrey',
    city: 'Surrey',
    metaTitle: 'Website Design & SEO in Surrey, BC',
    metaDescription:
      'Website design and SEO for small businesses in Surrey, BC. LinoCon Digital builds fast, mobile-friendly websites and sets up local SEO for Surrey neighbourhoods.',
    headline: 'Website design and SEO for small businesses in Surrey.',
    accent: 'Surrey',
    intro:
      'Surrey is big and growing, and lots of new businesses are competing to be found. We build websites and local SEO that help Surrey customers find you first.',
    local: {
      heading: 'Surrey is several towns in one. Your website should say which.',
      body: [
        'People in Surrey often search by neighbourhood: Newton, Guildford, Fleetwood, Cloverdale, City Centre or South Surrey. A business that only says “Surrey” can miss the customers searching for their own part of the city.',
        'We plan your pages around the areas you actually serve, so Google can match you with nearby searches. If you also work in Langley, Delta or White Rock, we include those too.',
      ],
    },
    who: [
      'Trades, contractors and renovation companies',
      'Moving, cleaning and home services',
      'Restaurants and food businesses',
      'Trucking, auto and repair businesses',
      'Clinics and health practices',
      'Family-run shops and new start-ups',
    ],
    faq: [
      {
        title: 'Do I need to meet you in person?',
        body: 'No. Calls, updates and approvals all happen online, and you follow your project on your own client page.',
      },
      {
        title: 'I serve Surrey and nearby cities. Can my website cover all of them?',
        body: 'Yes. We show your main area clearly and list the nearby places you also work, without stuffing the page with city names.',
      },
      {
        title: 'Can you move my website from another company?',
        body: 'Yes. See our page on switching to LinoCon. You never need to share passwords with us.',
      },
    ],
  },
  {
    slug: 'web-design-richmond',
    city: 'Richmond',
    metaTitle: 'Website Design & SEO in Richmond, BC',
    metaDescription:
      'Website design and SEO for small businesses in Richmond, BC. Fast, mobile-friendly websites and local SEO from LinoCon Digital in nearby Vancouver.',
    headline: 'Website design and SEO for small businesses in Richmond.',
    accent: 'Richmond',
    intro:
      'From City Centre to Steveston, Richmond businesses need to be easy to find on Google. We build fast websites and set up local SEO from just across the river in Vancouver.',
    local: {
      heading: 'Help Richmond customers find you, in the words they search.',
      body: [
        'Richmond has busy shopping areas along No. 3 Road, the village feel of Steveston, and lots of businesses that serve customers in more than one language. Your website should make it easy for all of them to understand what you offer.',
        'We set up your pages, page titles and Google Business Profile so Google can match you with people searching nearby. If you have customers in Vancouver, Delta or the airport area too, we include those.',
      ],
    },
    who: [
      'Restaurants, bakeries and food businesses',
      'Shops and retailers in City Centre and Steveston',
      'Import, export and trade businesses',
      'Clinics, wellness and beauty businesses',
      'Tutoring, education and family services',
      'Trades and home services',
    ],
    faq: [
      {
        title: 'Can my website be in more than one language?',
        body: 'Tell us what you need on the free call. We’ll explain the options and what each one involves before you decide.',
      },
      {
        title: 'Do you work with businesses in Richmond?',
        body: 'Yes. We’re based in nearby Vancouver and work with businesses across BC, all online.',
      },
      {
        title: 'What should I do first?',
        body: 'Start with a free website audit. We’ll show you how your business shows up on Google today and what to fix first.',
      },
    ],
  },
]

export const areaPath = (a) => `/${a.slug}`

export function getArea(slug) {
  return AREAS.find((a) => a.slug === slug)
}
