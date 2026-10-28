import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { CONTACT_EMAIL } from '../lib/leads'
import usePageMeta from '../lib/usePageMeta'
import EmailUs from '../components/EmailUs'

const UPDATED = 'October 20, 2026'

// Written for Canadian privacy law (PIPEDA and BC's PIPA). If the site starts
// collecting something new (a new form, tool or tracker), add it here.
export default function Privacy() {
  usePageMeta(
    'Privacy Policy',
    'How LinoCon Digital collects, uses and protects your personal information.',
  )

  const email = (
    <EmailUs className="text-text underline decoration-blue underline-offset-2">{CONTACT_EMAIL}</EmailUs>
  )

  return (
    <section className="min-h-screen pt-40 pb-28">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal className="mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
            Legal
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mt-4">
            Privacy Policy
          </h1>
          <p className="text-text-tertiary mt-4">Last updated {UPDATED}</p>
        </Reveal>

        <div className="prose-article">
          <p>
            LinoCon Digital (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a web design and SEO business
            based in Vancouver, British Columbia, Canada. This policy explains what personal
            information we collect through linocondigital.com and our services, why we collect it,
            and the choices you have. We follow Canada&rsquo;s Personal Information Protection and
            Electronic Documents Act (PIPEDA) and British Columbia&rsquo;s Personal Information
            Protection Act (PIPA).
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>When you ask for a free audit:</strong> your website address and email.
            </li>
            <li>
              <strong>When you join the LinoCon Books waitlist:</strong> your name, email, business
              name and which option you&rsquo;re interested in. We only use it to contact you about
              LinoCon Books.
            </li>
            <li>
              <strong>When you refer a friend:</strong> your name and email, and your
              friend&rsquo;s name, business name and email, plus anything you add in the note. Please
              only refer someone who knows you&rsquo;re sharing their details. We use your
              friend&rsquo;s details only to contact them once about your referral, and yours to
              apply your referral savings. If your friend doesn&rsquo;t want to hear from us, we
              delete their details.
            </li>
            <li>
              <strong>When you ask to switch to us:</strong> your name, email, business name,
              website address, where your website is built, who looks after it now, when their
              plan ends, what you&rsquo;d like us to take over, and anything you add in the note.
              We never ask for passwords. If you later add us as a helper on your accounts (such
              as Google Business Profile or Analytics), you stay the owner and can remove us at
              any time.
            </li>
            <li>
              <strong>When you book a call:</strong> your name, email, company or website, and what
              you&rsquo;d like to achieve. If you then pick a time in our booking calendar
              (Cal.com), Cal.com collects the details you enter there.
            </li>
            <li>
              <strong>When you email us:</strong> your email address and whatever you choose to
              include in your message.
            </li>
            <li>
              <strong>When you message us on social media</strong> (such as our Facebook Page): your
              name, profile and what you send us. The platform&rsquo;s own privacy policy also
              applies.
            </li>
            <li>
              <strong>When you become a client:</strong> your business and contact details, the
              information you share about your website and online accounts, project notes,
              proposals and agreements, and progress reports. These are kept on a private page
              for your project.
            </li>
            <li>
              <strong>When you pay us:</strong> payments are handled by Stripe. We see your name,
              email and what you paid, but we never see or store your full card or bank details.
            </li>
            <li>
              <strong>When you browse the site:</strong> Google Analytics collects information
              such as pages visited, how you arrived, your general location (city or region),
              device and browser type, and whether you used our forms or booked a call. It uses
              cookies to do this. Our hosting provider also keeps short-term technical logs (such
              as IP addresses) to run and protect the site.
            </li>
          </ul>
          <p>
            We don&rsquo;t ask for sensitive information such as health, financial account or
            government ID details, and we ask that you don&rsquo;t send it to us.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>To reply to you, run your free audit, and set up and hold your call.</li>
            <li>To contact a business you referred to us, and to apply your referral savings.</li>
            <li>To provide, report on and bill for the services you sign up for.</li>
            <li>To understand how people use our site so we can improve it.</li>
            <li>To keep the site and our records secure, and to meet legal and tax obligations.</li>
          </ul>
          <p>
            We will not sell, rent or trade your personal information. We won&rsquo;t add you to a
            marketing email list unless you ask to join it, and you can leave at any time.
          </p>

          <h2>Your consent</h2>
          <p>
            By sending a form, booking a call or becoming a client, you agree to us using your
            information as described here. You can withdraw your consent at any time by emailing{' '}
            {email}. If you do, we may no longer be able to provide some services.
          </p>

          <h2>Cookies and analytics</h2>
          <p>
            We use Google Analytics, which sets cookies (such as <code>_ga</code>) to tell visits
            apart. These cookies don&rsquo;t tell us who you are. You can block or delete cookies
            in your browser settings, or install Google&rsquo;s{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
              Analytics opt-out add-on
            </a>
            . Our booking calendar and payment pages are provided by Cal.com and Stripe, which may
            set their own cookies.
          </p>

          <h2>Who we share it with</h2>
          <p>
            We share information only with the service providers that help us run the business,
            and only what they need to do their job:
          </p>
          <ul>
            <li><strong>Vercel</strong> hosts this website.</li>
            <li><strong>Web3Forms</strong> delivers our website forms to our inbox.</li>
            <li><strong>Google</strong> (Gmail, Google Analytics and Google Fonts) for email and site statistics.</li>
            <li><strong>Cal.com</strong> schedules calls.</li>
            <li><strong>Stripe</strong> processes payments.</li>
            <li><strong>Upstash</strong> stores client project pages.</li>
          </ul>
          <p>
            Some of these providers store information outside Canada, mainly in the United States,
            where it may be accessed by courts or authorities under local law. We may also share
            information if the law requires it.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep enquiries for up to two years if you don&rsquo;t become a client. For clients,
            we keep project and billing records for as long as we work together and then for up to
            seven years, as Canadian tax rules require. After that we delete it. You can ask us to
            delete your information sooner, unless we must keep it by law.
          </p>

          <h2>How we protect it</h2>
          <p>
            Our accounts are password-protected and we use providers with strong security. Client
            project pages are private, can only be opened with their unique link, and are hidden
            from search engines. No method of sending or storing data online is completely secure,
            but we take reasonable care to protect your information.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask to see the personal information we hold about you, ask us to correct it, or
            ask us to delete it. Email {email} and we&rsquo;ll respond within 30 days.
          </p>
          <p>
            If you&rsquo;re not happy with our answer, you can contact the{' '}
            <a href="https://www.oipc.bc.ca" target="_blank" rel="noopener">
              Office of the Information and Privacy Commissioner for British Columbia
            </a>{' '}
            or the{' '}
            <a href="https://www.priv.gc.ca" target="_blank" rel="noopener">
              Office of the Privacy Commissioner of Canada
            </a>
            .
          </p>

          <h2>Children</h2>
          <p>
            Our services are for businesses. We don&rsquo;t knowingly collect information from
            anyone under 16.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we change how we handle personal information, we&rsquo;ll update this page and the
            date at the top.
          </p>

          <h2>Contact us</h2>
          <p>
            LinoCon Digital, Vancouver, British Columbia, Canada.
            <br />
            Privacy questions: {email}
          </p>
          <p>
            <Link to="/">Back to the homepage</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
