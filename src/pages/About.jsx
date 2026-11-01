import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import usePageMeta from '../lib/usePageMeta'

// "Our story": why Lino started LinoCon Digital, in Lino's own (polished) words.
export default function About() {
  usePageMeta(
    'Our story',
    'Why LinoCon Digital started: building a website is the easy part. Getting found on Google is the real challenge, and we help small businesses get there.',
  )

  return (
    <section className="min-h-screen pt-40 pb-28">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Reveal className="mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
            About LinoCon Digital
          </span>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight mt-4 text-balance">
            Why I started <span className="text-gradient">LinoCon Digital</span>
          </h1>
        </Reveal>

        <Reveal className="prose-article">
          <p>
            Starting a business is exciting, and it&rsquo;s also hard. Every business wants to
            grow, and one of the best first steps is a website that shows the world what you can
            do.
          </p>
          <p>
            Building a website isn&rsquo;t the hard part anymore. The real challenge is getting
            found, which means showing up near the top of Google when people search for what you
            offer. Most business owners need someone in their corner to help them get there.
          </p>
          <p>
            That&rsquo;s why I started LinoCon Digital. We build your website, help it rank on
            Google, and grow your name online, so people can find you, trust you and choose you.
            Our goal is simple: to help you reach your goals and grow your business.
          </p>
          <p className="font-display font-bold text-2xl md:text-3xl text-text !mt-10">
            Get found. Get chosen. Get <span className="text-gradient">growing.</span>
          </p>
          <p className="text-text-secondary">&mdash; Lino Consulta, founder of LinoCon Digital</p>
        </Reveal>

        <Reveal className="mt-16 rounded-3xl border border-border bg-white/[0.03] p-8 md:p-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Let&rsquo;s grow your business together</h2>
          <p className="text-text-secondary mt-3">
            Based in Vancouver, BC, and working remotely with small businesses across Canada and the
            US. Tell us about your business and we&rsquo;ll show you where to start.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/book"
              className="flex items-center h-12 px-6 rounded-full bg-gradient-brand text-ink text-sm font-bold"
            >
              Book a free call
            </Link>
            <a
              href="/#services"
              className="flex items-center h-12 px-6 rounded-full border border-white/20 text-sm font-bold hover:bg-white/5 transition-colors"
            >
              See our services
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
