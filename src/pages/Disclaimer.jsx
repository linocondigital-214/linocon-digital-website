import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { CONTACT_EMAIL } from '../lib/leads'
import usePageMeta from '../lib/usePageMeta'

const UPDATED = 'October 16, 2026'

// General website disclaimer. Client work is governed by each client's own
// proposal and service agreement, which take priority over this page.
export default function Disclaimer() {
  usePageMeta(
    'Disclaimer',
    'What you should know about results, prices, articles and outside links on linocondigital.com.',
  )

  const email = (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  )

  return (
    <section className="min-h-screen pt-40 pb-28">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal className="mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
            Legal
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mt-4">
            Disclaimer
          </h1>
          <p className="text-text-tertiary mt-4">Last updated {UPDATED}</p>
        </Reveal>

        <div className="prose-article">
          <p>
            LinoCon Digital (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a web design and SEO business
            based in Vancouver, British Columbia, Canada. This page explains the limits of the
            information on linocondigital.com and what you can and can&rsquo;t expect from our
            services. By using this site, you accept this disclaimer.
          </p>

          <h2>No guaranteed results</h2>
          <p>
            We work hard to help your business get found online, but we can&rsquo;t promise any
            particular result. Search engines such as Google decide rankings with their own
            systems, which they change often and don&rsquo;t fully share. Your results also depend
            on things outside our control, such as your industry, your competitors, your location,
            your website&rsquo;s history and how you run your business.
          </p>
          <p>
            That means we don&rsquo;t guarantee a specific ranking, position in search results or
            maps, amount of traffic, number of leads or calls, sales, or how quickly any of these
            happen. Backlinks we build or request may be changed or removed by the sites that host
            them. Any timelines or examples we give are estimates, not promises.
          </p>

          <h2>Articles are general information</h2>
          <p>
            Our articles and other content are written to give general information about websites,
            SEO and online marketing. They are not legal, tax, accounting, financial or other
            professional advice, and they may not fit your situation. Costs, tools and search
            engine rules change over time, so some details may become out of date. Please check
            with a qualified professional before making decisions based on what you read here.
          </p>

          <h2>Prices</h2>
          <p>
            Prices on this site are in Canadian dollars (CAD) and don&rsquo;t include applicable
            taxes unless we say so. Prices, services and offers can change at any time without
            notice. The price and scope for your project are the ones in your written proposal or
            service agreement.
          </p>

          <h2>Outside links, tools and services</h2>
          <p>
            Our site and articles may link to other websites, tools and platforms (for example
            Google, Cal.com or Stripe). We don&rsquo;t control them and aren&rsquo;t responsible
            for their content, accuracy, availability, privacy practices or terms. A link
            isn&rsquo;t an endorsement. Your use of those services is between you and them, under
            their own terms.
          </p>
          <p>
            Some of our work relies on third-party platforms, such as search engines, website
            hosts, Google Business Profile and social media sites. If one of them changes its
            rules, has an outage or suspends an account, that is outside our control.
          </p>

          <h2>Accuracy of this site</h2>
          <p>
            We try to keep this website accurate and up to date, but it is provided &ldquo;as
            is&rdquo; without warranties of any kind. We may make mistakes, and we may change or
            remove content at any time.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent allowed by law, LinoCon Digital is not liable for any loss or
            damage that comes from using this website, relying on its content, or using any linked
            website or service. This includes lost profits, lost data or business interruption.
            Nothing on this page limits any rights you have that can&rsquo;t be limited by law.
          </p>

          <h2>Client agreements come first</h2>
          <p>
            If you are a client, your signed proposal and service agreement set out exactly what we
            will do. If anything on this page is different from your agreement, your agreement
            applies.
          </p>

          <h2>Governing law</h2>
          <p>
            This disclaimer is governed by the laws of British Columbia and the federal laws of
            Canada that apply there.
          </p>

          <h2>Changes to this disclaimer</h2>
          <p>
            We may update this page from time to time. When we do, we&rsquo;ll change the date at
            the top.
          </p>

          <h2>Contact us</h2>
          <p>
            LinoCon Digital, Vancouver, British Columbia, Canada.
            <br />
            Questions about this disclaimer: {email}
          </p>
          <p>
            Read our <Link to="/privacy">Privacy Policy</Link>, or go{' '}
            <Link to="/">back to the homepage</Link>.
          </p>
        </div>
      </div>
    </section>
  )
}
