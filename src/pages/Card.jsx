import { Link } from 'react-router-dom'
import Mark from '../components/Logo'
import { SOCIALS } from '../components/sections/Footer'
import { CONTACT_EMAIL } from '../lib/leads'
import { track } from '../lib/analytics'
import usePageMeta from '../lib/usePageMeta'

// Digital business card, full screen with no site menu. The printed card's
// QR code and the card PDFs live in the project files (business-card/).
// The contact file is public/linocon-digital.vcf; keep it in step with this page.
const CONTACT_FILE = '/linocon-digital.vcf'

export default function Card() {
  usePageMeta(
    'Digital Business Card',
    'Save LinoCon Digital to your contacts. Websites, SEO and backlinks for businesses across Canada and the US, based in Vancouver, BC.',
  )

  const share = async () => {
    track('card_share_click')
    const data = { title: 'LinoCon Digital', text: 'Get found. Get chosen. Get growing.', url: 'https://linocondigital.com/card' }
    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch {
        // The visitor closed the share sheet.
      }
    } else {
      await navigator.clipboard?.writeText(data.url)
      alert('Link copied')
    }
  }

  return (
    <section className="relative min-h-svh overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute -top-48 -left-48 w-[560px] h-[560px] rounded-full opacity-25 bg-[radial-gradient(closest-side,var(--color-blue),transparent)]" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 w-[560px] h-[560px] rounded-full opacity-20 bg-[radial-gradient(closest-side,var(--color-orange),transparent)]" />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-surface/80 backdrop-blur p-7 sm:p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <Mark className="w-14 h-11" gradientId="cardGradient" />
          <div>
            <h1 className="font-display font-bold text-3xl">LinoCon Digital</h1>
            <p className="mt-2 text-text-secondary">
              Get found. Get chosen. <span className="text-gradient font-semibold">Get growing.</span>
            </p>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-text-secondary">
            Websites · SEO · Backlinks
          </p>
        </div>

        <a
          href={CONTACT_FILE}
          onClick={() => track('save_contact_click')}
          className="w-full rounded-full bg-gradient-brand py-3.5 font-semibold text-white"
        >
          Save contact
        </a>

        <div className="w-full flex flex-col gap-2.5 text-left">
          <Row href={`mailto:${CONTACT_EMAIL}`} label="Email" value={CONTACT_EMAIL} />
          <Row href="/" label="Website" value="linocondigital.com" internal />
          <Row href="/book" label="Book a free call" value="Pick a time that suits you" internal />
          <Row label="Based in Vancouver, BC" value="Working across Canada & the US" />
        </div>

        <div className="flex items-center gap-2.5">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener"
              aria-label={`LinoCon Digital on ${s.label}`}
              title={s.label}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 text-text-secondary hover:text-text hover:bg-white/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>

        <button type="button" onClick={share} className="text-sm font-semibold text-text-secondary hover:text-text">
          Share this card
        </button>
      </div>
    </section>
  )
}

function Row({ href, label, value, internal }) {
  const body = (
    <>
      <span className="block text-xs font-bold tracking-widest uppercase text-text-secondary">{label}</span>
      <span className="block mt-0.5 text-text">{value}</span>
    </>
  )
  const cls = 'block rounded-2xl border border-white/10 px-4 py-3'
  if (!href) return <div className={cls}>{body}</div>
  if (internal)
    return (
      <Link to={href} className={`${cls} hover:bg-white/5 transition-colors`}>
        {body}
      </Link>
    )
  return (
    <a href={href} className={`${cls} hover:bg-white/5 transition-colors`}>
      {body}
    </a>
  )
}
