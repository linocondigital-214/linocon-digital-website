import { Link } from 'react-router-dom'
import Reveal from '../Reveal'

// Answers can link to other parts of the site with [label](href). The same text
// (links stripped to their label) feeds the FAQPage structured data for Google.
const FAQS = [
  {
    q: 'How much does a website cost?',
    a: "Every website is different, so we don't use a one-size-fits-all price. Your project is quoted based on the number of pages, design requirements, functionality, content, integrations, and SEO setup you need. We'll discuss your goals during a [free strategy call](/book), then provide a clear project quote before any work begins.",
  },
  {
    q: 'How long until my site is live?',
    a: "It depends on the size and complexity of your website. A straightforward business website can move much faster than a larger site with custom functionality, e-commerce, or extensive content. Before we begin, we'll agree on a realistic launch timeline and key milestones.",
  },
  {
    q: 'How soon will I see results on Google?',
    a: 'SEO is a long-term process, not an overnight result. Your technical SEO foundation can be improved immediately, but Google needs time to crawl, index, evaluate, and rank your website and content. Results also depend on your industry, competition, content, website authority, and backlink profile. We focus on building a strong foundation and improving visibility over time.',
  },
  {
    q: 'Do I need every service?',
    a: "No. You can start with a new website, improve the SEO of your existing website, or focus specifically on relevant backlinks. However, [the services](#services) work particularly well together: a strong website improves the visitor experience, SEO helps search engines understand and discover your site, and quality backlinks can support authority. [LinoCon Books](/books) is coming soon and is separate: it's your own app for invoices, expenses and GST, and you can join the waitlist for free.",
  },
  {
    q: 'Are your backlinks safe?',
    a: "We focus on relevant, quality backlink opportunities rather than mass-produced or spammy links. We avoid link farms, automated link schemes, and irrelevant placements that provide little value. Our goal is to build a backlink profile that supports your website's authority and fits naturally within your broader SEO strategy.",
  },
  {
    q: 'Can you help if I already have a website?',
    a: "Absolutely. You don't always need a brand-new website. If your existing site is outdated, difficult to navigate, slow, or lacking a solid SEO foundation, we can identify what needs improvement and recommend the most practical next step. That may mean optimizing your existing website rather than rebuilding it. A [free audit](#audit) is a good place to start.",
  },
  {
    q: 'What do you need from me?',
    a: "We start with a short strategy call to understand your business, goals, customers, and what you want your website to accomplish. If you have a logo, photos, written content, brand guidelines, or other materials, you can provide them. Don't have everything ready? We'll tell you what we need and guide you through the process.",
  },
  {
    q: 'Do you work with businesses outside Canada?',
    a: "Yes. LinoCon Digital works with businesses internationally. Our website creation, SEO setup, and backlink services are designed to support businesses wherever they operate. We'll consider your target market, industry, competitors, and search audience so the approach fits your business and location.",
  },
  {
    q: 'Do you provide ongoing SEO after the website is launched?',
    a: "Yes. SEO doesn't have to stop when your website goes live. Depending on your goals, ongoing work can include technical improvements, content strategy, on-page optimization, search performance monitoring, and backlink development. We'll recommend the level of support that makes sense for your business.",
  },
  {
    q: "Can you help me if I don't know what my business needs?",
    a: "Yes, and that's exactly what the [strategy call](/book) is for. You don't need to understand website development, SEO, or backlinks before contacting us. We'll review where your business is today, understand what you're trying to achieve, identify the biggest opportunities, and recommend a practical starting point. You can then decide what you want to do with no pressure.",
  },
]

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g

// The global `a` reset in index.css is unlayered, so these need ! to win over it.
const linkClass = 'text-text! underline! underline-offset-4 decoration-white/30 hover:decoration-white'

function renderAnswer(text) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match
    parts.push(text.slice(last, match.index))
    parts.push(
      href.startsWith('/') ? (
        <Link key={match.index} to={href} className={linkClass}>{label}</Link>
      ) : (
        <a key={match.index} href={href} className={linkClass}>{label}</a>
      ),
    )
    last = match.index + whole.length
  }
  parts.push(text.slice(last))
  return parts
}

const faqSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a.replace(LINK, '$1') },
  })),
}).replace(/</g, '\\u003c')

export default function FAQ() {
  return (
    <section id="faq" className="py-28 md:py-36 border-t border-border">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-12">
            Questions, answered.
          </h2>
        </Reveal>
        <div className="flex flex-col">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04} y={16}>
              <details className="group border-b border-border py-6">
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none font-display font-semibold text-xl md:text-2xl [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center transition-transform duration-300 group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="text-text-secondary leading-relaxed mt-4 md:text-lg max-w-2xl">{renderAnswer(f.a)}</p>
              </details>
            </Reveal>
          ))}
        </div>
        <Reveal y={16}>
          <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <p className="text-lg md:text-xl text-text-secondary">
              Not sure what your business needs? Book a free strategy call and we&#39;ll help you identify the right starting point.
            </p>
            <Link
              to="/book"
              className="shrink-0 self-start sm:self-auto flex items-center h-12 px-6 rounded-full bg-gradient-brand text-ink text-sm font-bold"
            >
              Book a free call
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
