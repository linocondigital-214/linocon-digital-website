// City pages (/web-design-<city>) for local Google searches like
// "web design Burnaby". Each city has its own wording, not the same text with
// the name swapped, because Google ignores near-copies. Keep facts general and
// true: no fake addresses, reviews or numbers. The footer, the Who we work
// with page, the routes in App.jsx and the schema in entry-server.jsx all read
// from this list. Add each new city to public/sitemap.xml too. Region pages
// (region: true) link to the cities they cover; footer: false keeps a city
// out of the footer list so it stays short.
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
  {
    slug: 'web-design-coquitlam',
    city: 'Coquitlam',
    metaTitle: 'Website Design & SEO in Coquitlam, BC',
    metaDescription:
      'Website design and SEO for small businesses in Coquitlam and the Tri-Cities. Fast, mobile-friendly websites and local SEO from LinoCon Digital in nearby Vancouver.',
    headline: 'Website design and SEO for small businesses in Coquitlam.',
    accent: 'Coquitlam',
    intro:
      'Coquitlam is the biggest of the Tri-Cities, with busy shopping areas and new neighbourhoods filling in fast. We build websites and local SEO that help Coquitlam customers find you first.',
    local: {
      heading: 'From Coquitlam Centre to Burke Mountain.',
      body: [
        'Coquitlam customers search by area too: City Centre, Austin Heights, Maillardville, Westwood Plateau, Burke Mountain. With the Evergreen line connecting the Tri-Cities to Burnaby and Vancouver, many businesses here also serve customers across the region.',
        'We set up your website and Google Business Profile so Google knows you’re in Coquitlam and which nearby places you also serve, like Port Coquitlam, Port Moody and Burnaby.',
      ],
    },
    who: [
      'Shops and restaurants near Coquitlam Centre',
      'Trades, renovation and home services',
      'Clinics, dentists and wellness businesses',
      'Tutoring, music and family services',
      'Real estate, mortgage and professional services',
      'New businesses in growing neighbourhoods',
    ],
    faq: [
      {
        title: 'Do you work with businesses in the Tri-Cities?',
        body: 'Yes. We work with businesses in Coquitlam, Port Coquitlam and Port Moody, all online from nearby Vancouver.',
      },
      {
        title: 'My customers come from all three Tri-Cities. Can my website cover them?',
        body: 'Yes. We show Coquitlam as your main area and mention the nearby cities you also serve, in a natural way.',
      },
      {
        title: 'How do I get started?',
        body: 'Ask for a free website audit or book a strategy call. We’ll show you how you appear on Google today.',
      },
    ],
  },
  {
    slug: 'web-design-port-coquitlam',
    city: 'Port Coquitlam',
    footer: false,
    metaTitle: 'Website Design & SEO in Port Coquitlam, BC',
    metaDescription:
      'Website design and SEO for small businesses in Port Coquitlam (PoCo) and the Tri-Cities. Fast, mobile-friendly websites and local SEO from LinoCon Digital.',
    headline: 'Website design and SEO for small businesses in Port Coquitlam.',
    accent: 'Port Coquitlam',
    intro:
      'PoCo is full of local trades, family businesses and loyal customers. We help Port Coquitlam businesses show up when people nearby search on Google.',
    local: {
      heading: 'Be the PoCo business people find first.',
      body: [
        'Many people in Port Coquitlam search for local services by name: “PoCo plumber”, “Port Coquitlam bakery”, “near me”. If your website and Google Business Profile don’t clearly say where you are, those searches go to someone else.',
        'We make sure Google sees you as a Port Coquitlam business, from downtown near Shaughnessy Street to Citadel Heights and Riverwood, and that it knows you also serve Coquitlam, Port Moody and Pitt Meadows if you do.',
      ],
    },
    who: [
      'Trades, contractors and home services',
      'Auto, repair and industrial businesses',
      'Family-run shops and restaurants',
      'Clinics and wellness businesses',
      'Sports, fitness and recreation businesses',
      'New businesses that need their first website',
    ],
    faq: [
      {
        title: 'Can my website use “PoCo” as well as Port Coquitlam?',
        body: 'Yes. We use both naturally in your page wording, since local customers search both ways.',
      },
      {
        title: 'Do I need to meet you in person?',
        body: 'No. Calls, updates and approvals all happen online, and you follow your project on your own client page.',
      },
      {
        title: 'Can you move my website from another company?',
        body: 'Yes. See our page on switching to LinoCon. You never need to share passwords with us.',
      },
    ],
  },
  {
    slug: 'web-design-port-moody',
    city: 'Port Moody',
    footer: false,
    metaTitle: 'Website Design & SEO in Port Moody, BC',
    metaDescription:
      'Website design and SEO for small businesses in Port Moody and the Tri-Cities. Fast, mobile-friendly websites and local SEO from LinoCon Digital in nearby Vancouver.',
    headline: 'Website design and SEO for small businesses in Port Moody.',
    accent: 'Port Moody',
    intro:
      'Port Moody has a strong local scene, from Brewers Row to Rocky Point and Newport Village. We help Port Moody businesses get found by locals and visitors on Google.',
    local: {
      heading: 'Help locals and visitors find you.',
      body: [
        'Port Moody businesses serve two kinds of customers: people who live nearby, and people who come in for the waterfront, the trails and Brewers Row. Both groups search on their phones, often with “near me”.',
        'We build a fast, phone-friendly website and set up your Google Business Profile so you show up in those searches, with your hours, photos and location easy to see.',
      ],
    },
    who: [
      'Breweries, cafés and restaurants',
      'Shops and studios in Newport Village and Suter Brook',
      'Outdoor, fitness and recreation businesses',
      'Clinics and wellness businesses',
      'Trades and home services',
      'Artists, makers and creative businesses',
    ],
    faq: [
      {
        title: 'Can you help visitors find my business, not just locals?',
        body: 'Yes. We set up your website and Google Business Profile for “near me” searches and make your location, hours and directions easy to find.',
      },
      {
        title: 'Do you work with businesses in the Tri-Cities?',
        body: 'Yes. We work with businesses in Port Moody, Coquitlam and Port Coquitlam, all online from nearby Vancouver.',
      },
      {
        title: 'What should I do first?',
        body: 'Start with a free website audit. We’ll show you how your business shows up on Google today and what to fix first.',
      },
    ],
  },
  {
    slug: 'web-design-lower-mainland',
    city: 'the Lower Mainland',
    label: 'Lower Mainland',
    region: true,
    schemaType: 'Place',
    covers: [
      'web-design-vancouver',
      'web-design-burnaby',
      'web-design-richmond',
      'web-design-surrey',
      'web-design-coquitlam',
      'web-design-port-coquitlam',
      'web-design-port-moody',
      'web-design-fraser-valley',
    ],
    metaTitle: 'Website Design & SEO in the Lower Mainland, BC',
    metaDescription:
      'Website design and SEO for small businesses across the Lower Mainland, from Vancouver to the Fraser Valley. Fast, mobile-friendly websites and local SEO from LinoCon Digital.',
    headline: 'Website design and SEO for small businesses across the Lower Mainland.',
    accent: 'the Lower Mainland',
    intro:
      'From Vancouver and the North Shore to Surrey, Langley and the Fraser Valley, we help small businesses across the Lower Mainland get found on Google.',
    local: {
      heading: 'One region, lots of local searches.',
      body: [
        'The Lower Mainland is many cities side by side, and customers usually search for the one they live in. A business that serves several cities needs a website that makes each of those areas clear to Google.',
        'We plan your pages around the places you actually serve, whether that’s one neighbourhood or the whole region, and keep your Google Business Profile in step with your website.',
      ],
    },
    who: [
      'Service businesses that travel across several cities',
      'Trades, contractors and home services',
      'Restaurants, cafés and local shops',
      'Clinics and health practices',
      'Consultants and professional services',
      'New businesses that need their first website',
    ],
    faq: [
      {
        title: 'Do you cover my city?',
        body: 'If you’re in the Lower Mainland, yes. We work online, so it doesn’t matter whether you’re in North Vancouver, Delta, Langley or Maple Ridge.',
      },
      {
        title: 'I serve several cities. Do I need a page for each?',
        body: 'Sometimes. On the free call we look at where your customers are and tell you honestly whether extra area pages would help.',
      },
      {
        title: 'How do I get started?',
        body: 'Ask for a free website audit or book a strategy call at a time that suits you.',
      },
    ],
  },
  {
    slug: 'web-design-fraser-valley',
    city: 'the Fraser Valley',
    label: 'Fraser Valley',
    region: true,
    schemaType: 'Place',
    covers: ['web-design-lower-mainland', 'web-design-surrey', 'web-design-coquitlam'],
    metaTitle: 'Website Design & SEO in the Fraser Valley, BC',
    metaDescription:
      'Website design and SEO for small businesses in the Fraser Valley: Abbotsford, Chilliwack, Mission, Langley and nearby. Fast, mobile-friendly websites and local SEO from LinoCon Digital.',
    headline: 'Website design and SEO for small businesses in the Fraser Valley.',
    accent: 'the Fraser Valley',
    intro:
      'From Langley and Abbotsford to Mission, Chilliwack and Hope, Fraser Valley businesses deserve to be found as easily as anyone in the city. We build websites and local SEO that make that happen.',
    local: {
      heading: 'Get found in your valley town, not lost behind Vancouver.',
      body: [
        'When someone in Abbotsford or Chilliwack searches for a service, Google often shows big Vancouver businesses first. A clear local website and a complete Google Business Profile help you show up for the people right in your own community.',
        'We set up your pages for the towns you serve, from Langley and Aldergrove to Abbotsford, Mission, Chilliwack, Agassiz and Hope.',
      ],
    },
    who: [
      'Farms, farm stores and agri-businesses',
      'Trades, contractors and home services',
      'Auto, trucking and repair businesses',
      'Restaurants, cafés and wineries',
      'Clinics and wellness businesses',
      'Family-run shops and new start-ups',
    ],
    faq: [
      {
        title: 'Do you work with businesses outside Metro Vancouver?',
        body: 'Yes. Everything happens online, so Fraser Valley businesses get the same service as anyone in the city.',
      },
      {
        title: 'Can my website cover several Fraser Valley towns?',
        body: 'Yes. We show your main town clearly and mention the nearby places you also serve, without stuffing the page with names.',
      },
      {
        title: 'What should I do first?',
        body: 'Start with a free website audit. We’ll show you how your business shows up on Google today and what to fix first.',
      },
    ],
  },
]

export const areaPath = (a) => `/${a.slug}`

// Short name for links, e.g. "Lower Mainland" rather than "the Lower Mainland".
export const areaLabel = (a) => a.label || a.city

export function getArea(slug) {
  return AREAS.find((a) => a.slug === slug)
}
