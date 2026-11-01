import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import FounderSignature from '../FounderSignature'

// Short "Meet the founder" teaser on the homepage, linking to the full story on /about.
export default function Founder() {
  return (
    <section id="founder" className="py-24 md:py-32 border-t border-border">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <Reveal>
          <span className="text-sm font-bold tracking-widest uppercase text-orange">Meet the founder</span>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight mt-4 text-balance">
            Building a website is the easy part. <span className="text-gradient">Getting found</span> is the real work.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8 flex flex-col items-start gap-6">
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
            I started LinoCon Digital because most business owners need someone in their corner to
            show up on Google. We build your website, help it rank, and grow your name online, so
            you can focus on growing your business.
          </p>
          <FounderSignature />
          <Link
            to="/about"
            className="flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Read our story
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
