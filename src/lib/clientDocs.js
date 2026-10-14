// The proposal and service agreement for each client. Section text is a
// template: {{name}} fills in from the client's details or from the fields
// Lino types in (prices, dates, terms). Lino can rewrite any section for one
// client; that client's copy is saved in client.docs.<doc>.text.<section id>.
// Prices are never filled in for Lino: an empty field prints as a blank line.

export const BUSINESS = {
  name: 'LinoCon Digital',
  place: 'Vancouver, British Columbia',
  email: 'linocondigital@gmail.com',
  website: 'linocondigital.com',
}

// What each service covers, used in "What we'll do" and "Services".
export const SERVICE_SCOPE = {
  website: {
    name: 'Website Creation',
    scope:
      'A custom, mobile-first website designed around the business and its customers, with the pages agreed in the Plan, enquiry forms or booking, basic on-page SEO, analytics, testing and launch.',
    priceField: 'priceWebsite',
  },
  seo: {
    name: 'SEO Setup',
    scope:
      'Technical and on-page SEO: keyword-to-page mapping, page titles and descriptions, headings, internal links, sitemap and indexing, structured data where relevant, and Google Search Console and Analytics set up or checked.',
    priceField: 'priceSeo',
  },
  backlinks: {
    name: 'Backlink Building',
    scope:
      'Relevant local, industry and editorial links and citations, chosen for quality over volume, with a record of what was built.',
    priceField: 'priceBacklinks',
  },
  grow: {
    name: 'Ongoing Grow plan (monthly)',
    scope:
      'Monthly growth work after launch: measuring results, finding what changed and why, improving content, SEO, authority and conversions, and a monthly report, with a quarterly review against the starting baseline.',
    priceField: 'priceGrow',
  },
}

// Fields Lino types in. `doc` says which document's form shows the field;
// both documents can use every field.
export const DOC_FIELDS = [
  { key: 'proposalDate', label: 'Proposal date', type: 'date', doc: 'proposal' },
  { key: 'validUntil', label: 'Proposal valid until', type: 'date', doc: 'proposal' },
  { key: 'priceWebsite', label: 'Website Creation price', placeholder: 'e.g. $____ one-time', service: 'website', doc: 'proposal' },
  { key: 'priceSeo', label: 'SEO Setup price', placeholder: 'e.g. $____ one-time', service: 'seo', doc: 'proposal' },
  { key: 'priceBacklinks', label: 'Backlink Building price', placeholder: 'e.g. $____ per month', service: 'backlinks', doc: 'proposal' },
  { key: 'priceGrow', label: 'Grow plan price', placeholder: 'e.g. $____ per month', service: 'grow', doc: 'proposal' },
  { key: 'total', label: 'Total to start', placeholder: 'e.g. $____ + $____ per month', doc: 'proposal' },
  { key: 'deposit', label: 'Deposit before work starts', placeholder: 'e.g. 50% ($____)', doc: 'proposal' },
  { key: 'timeline', label: 'Timeline', placeholder: 'e.g. Audit and Plan: 2 weeks. Build & Launch: 4 to 6 weeks.', multiline: true, doc: 'proposal' },
  { key: 'agreementDate', label: 'Agreement date', type: 'date', doc: 'agreement' },
  { key: 'balanceTerms', label: 'When the balance is due', placeholder: 'e.g. at launch', doc: 'agreement' },
  { key: 'paymentDays', label: 'Invoices due within (days)', placeholder: 'e.g. 14', doc: 'agreement' },
  { key: 'revisions', label: 'Design revision rounds included', placeholder: 'e.g. 2', doc: 'agreement' },
  { key: 'extraRate', label: 'Rate for extra work', placeholder: 'e.g. $____ per hour', doc: 'agreement' },
  { key: 'growTerm', label: 'Grow plan minimum term', placeholder: 'e.g. 3 months', service: 'grow', doc: 'agreement' },
  { key: 'noticeDays', label: 'Notice to cancel (days)', placeholder: 'e.g. 30', doc: 'agreement' },
  { key: 'clientSigner', label: 'Client signer name and title', placeholder: 'e.g. Alex Smith, Owner', doc: 'agreement' },
]

// `services` limits a section to clients with one of those services ticked.
// `auto` sections are built from the client's services (see DocumentPage).
const PROPOSAL = [
  {
    id: 'intro',
    title: 'Overview',
    text: 'Thank you for considering {{agency}}. This proposal sets out how we will help {{business}} get found on Google, get chosen by the right customers, and keep growing. It covers what we will do, the investment, and the timeline.',
  },
  {
    id: 'approach',
    title: 'How we work',
    text: 'Every project follows the same four stages:\n1. Audit: we review your website, search visibility, competitors and local presence, and record your starting numbers.\n2. Plan: we turn the findings into a clear roadmap of pages, keywords, content and links, agreed with you before any build starts.\n3. Build & Launch: we build and test the website with SEO built in, then launch it.\n4. Grow: we keep improving visibility, authority and enquiries month after month, with regular reporting.\nYou approve each stage before the next one begins.',
  },
  { id: 'scope', title: "What we'll do", auto: 'scope' },
  { id: 'investment', title: 'Investment', auto: 'prices' },
  {
    id: 'investment-notes',
    title: 'Payment',
    text: 'All prices are in Canadian dollars (CAD) and do not include GST or PST, which are added where they apply. A deposit of {{deposit}} is due before work starts. Third-party costs such as the domain name, hosting, paid plugins or stock photos are paid by you directly to the provider, unless we agree otherwise in writing.',
  },
  { id: 'timeline', title: 'Timeline', text: '{{timeline}}\nTimelines depend on receiving content, access and approvals from you on time.' },
  {
    id: 'promise',
    title: 'What we promise',
    text: 'We do not guarantee specific rankings, traffic or numbers of leads, because no one honestly can. We promise a clear process: measure, decide, improve, and show you the work and the results.',
  },
  {
    id: 'next',
    title: 'Next steps',
    text: 'To go ahead, reply to let us know you accept this proposal. We will then send a Service Agreement to sign. Work begins once the agreement is signed and the deposit is received. This proposal is valid until {{validUntil}}.',
  },
]

const AGREEMENT = [
  {
    id: 'parties',
    title: '1. Parties',
    text: 'This Service Agreement is made on {{agreementDate}} between {{agency}}, of {{agencyPlace}} ("LinoCon Digital", "we"), and {{business}} ("the Client", "you").',
  },
  { id: 'services', title: '2. Services', auto: 'scope' },
  {
    id: 'scope-changes',
    title: '3. Changes to the scope',
    text: 'Work not listed above, or changes after a stage has been approved, will be quoted separately and only started once you agree to the quote in writing (email is fine).',
  },
  { id: 'fees', title: '4. Fees', auto: 'prices' },
  {
    id: 'payment',
    title: '5. Payment terms',
    text: 'Fees are as listed above, in Canadian dollars, plus GST or PST where they apply. A deposit of {{deposit}} is due before work starts. The balance of one-time fees is due {{balanceTerms}}. Invoices are due within {{paymentDays}} days. We may pause work while an invoice is overdue.',
  },
  {
    id: 'grow',
    title: '6. Grow plan (monthly)',
    services: ['grow'],
    text: 'The Grow plan is {{priceGrow}}, billed monthly in advance, starting after launch. It has a minimum term of {{growTerm}}. After that it continues month to month until either party cancels with {{noticeDays}} days written notice. Each month includes the work described in the monthly growth checklist and a monthly report. Unused work does not roll over to the next month.',
  },
  {
    id: 'client',
    title: '7. Your responsibilities',
    text: 'You will provide content, images, logins and approvals in reasonable time, and confirm you have the right to use any material you give us. Share logins securely (for example by adding us as a user); never send passwords by plain email. Delays in receiving these may move the timeline.',
  },
  {
    id: 'revisions',
    title: '8. Revisions',
    text: 'The website design includes {{revisions}} rounds of revisions. Further revisions or extra work are billed at {{extraRate}}, with your approval first.',
  },
  {
    id: 'ownership',
    title: '9. Ownership',
    text: 'Once all fees for the website are paid, you own the website content and design made for you. Your domain name is registered in your name and belongs to you. We keep ownership of our general tools, code and know-how, and grant you a licence to use them as part of your website. We may show the finished work in our portfolio unless you ask us not to.',
  },
  {
    id: 'results',
    title: '10. Results',
    text: 'Search engines, platforms and markets are outside our control. We do not guarantee specific rankings, traffic, leads or sales. We will carry out the agreed work with care and report honestly on the results.',
  },
  {
    id: 'third-party',
    title: '11. Third-party services',
    text: 'Hosting, domain names, plugins and other third-party services are provided under those providers\' own terms. We are not responsible for their outages, price changes or policy changes, but we will help you deal with them.',
  },
  {
    id: 'confidentiality',
    title: '12. Confidentiality',
    text: 'Each party will keep the other\'s confidential information private and use it only for this project. We will only use your logins and data to do the agreed work.',
  },
  {
    id: 'cancellation',
    title: '13. Cancellation',
    text: 'Either party may end this agreement with {{noticeDays}} days written notice. You pay for work done up to the end date, and the deposit covers work already started. When the agreement ends we will hand over your logins, files and website content once all invoices are paid.',
  },
  {
    id: 'liability',
    title: '14. Limitation of liability',
    text: 'Neither party is liable for indirect or consequential losses, such as lost profits. Our total liability under this agreement is limited to the fees you paid us in the three months before the claim.',
  },
  {
    id: 'law',
    title: '15. Governing law',
    text: 'This agreement is governed by the laws of the Province of British Columbia and the federal laws of Canada that apply there.',
  },
  {
    id: 'entire',
    title: '16. Entire agreement',
    text: 'This agreement, together with the accepted proposal, is the whole agreement between us. Any change must be agreed in writing by both parties.',
  },
]

export const DOCS = {
  proposal: {
    key: 'proposal',
    name: 'Proposal',
    title: 'Project proposal',
    sections: PROPOSAL,
    statuses: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'signed', label: 'Accepted' },
    ],
    signatures: false,
  },
  agreement: {
    key: 'agreement',
    name: 'Service agreement',
    title: 'Service agreement',
    sections: AGREEMENT,
    statuses: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'signed', label: 'Signed' },
    ],
    signatures: true,
  },
}

export const docState = (client, key) => client.docs?.[key] ?? {}

// Shown to the client once Lino marks the document as sent (or signed).
export const isShared = (client, key) => ['sent', 'signed'].includes(docState(client, key).status)

export const statusLabel = (key, status) =>
  DOCS[key].statuses.find((s) => s.value === (status || 'draft')).label

export function docSections(client, key) {
  const services = client.details.services ?? {}
  return DOCS[key].sections.filter((s) => !s.services || s.services.some((x) => services[x]))
}

export const selectedServices = (client) =>
  Object.entries(SERVICE_SCOPE)
    .filter(([key]) => client.details.services?.[key])
    .map(([key, s]) => ({ key, ...s }))

// Values for {{name}} in the templates. Fields typed in either document count.
export function docValues(client) {
  const d = client.details
  const fields = { ...client.docs?.proposal?.fields, ...client.docs?.agreement?.fields }
  return {
    agency: BUSINESS.name,
    agencyPlace: BUSINESS.place,
    business: d.name,
    contact: d.contact,
    website: d.website,
    serviceArea: d.serviceArea,
    ...fields,
  }
}

const DATE_FIELDS = new Set(DOC_FIELDS.filter((f) => f.type === 'date').map((f) => f.key))

// Splits a template into text and filled-in values, so pages can highlight
// what's still missing. Returns [{ text } | { field, value }].
export function fillTemplate(template, values, formatDate) {
  return template.split(/(\{\{\w+\}\})/).map((part) => {
    const m = part.match(/^\{\{(\w+)\}\}$/)
    if (!m) return { text: part }
    const raw = values[m[1]]
    const value = raw && DATE_FIELDS.has(m[1]) ? formatDate(raw) : raw
    return { field: m[1], value: value || '' }
  })
}

export const fieldLabel = (key) => DOC_FIELDS.find((f) => f.key === key)?.label ?? key
