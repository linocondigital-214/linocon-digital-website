// A made-up local search result, shown at the top of the city pages so
// visitors can picture what they get: their business showing up when someone
// nearby searches. Clearly labelled as an example. Not a real business, no
// ratings or numbers, and no search engine's logo or branding.
const TRADES = ['plumber', 'hair salon', 'dentist', 'café', 'electrician', 'bakery', 'physio', 'landscaper', 'mechanic']

export default function SampleResult({ city, index = 0 }) {
  const trade = TRADES[index % TRADES.length]
  const place = city.replace(/^the /, '')
  return (
    <figure className="w-full max-w-xl mx-auto mt-4 text-left" aria-label={`Example of a local search result for a ${trade} in ${place}`}>
      <div className="rounded-3xl border border-white/10 bg-surface/80 shadow-2xl shadow-black/50 p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-ink/70 px-5 h-12 text-text-secondary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>
            {trade} near me <span className="text-text-tertiary">· {place}</span>
          </span>
        </div>
        <div className="rounded-2xl border border-blue/40 bg-ink/50 p-5 flex flex-col gap-2">
          <span className="text-xs font-bold tracking-widest uppercase text-orange">Your business here</span>
          <span className="font-display font-bold text-xl">Your Business Name</span>
          <span className="text-sm text-text-secondary">
            {trade.charAt(0).toUpperCase() + trade.slice(1)} in {place} · Open now
          </span>
          <span className="text-sm text-blue truncate">yourbusiness.ca</span>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Website', 'Call', 'Directions'].map((b) => (
              <span key={b} className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold">
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 p-4 flex flex-col gap-2 opacity-50" aria-hidden="true">
          <span className="h-3 w-2/5 rounded-full bg-white/15" />
          <span className="h-2.5 w-3/5 rounded-full bg-white/10" />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-text-tertiary">
        Example only: how your business could appear when people nearby search.
      </figcaption>
    </figure>
  )
}
