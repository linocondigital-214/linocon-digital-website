const img = (name) => `${import.meta.env.BASE_URL}images/${name}`

// Lino's photo with name and title, used under the founder story.
export default function FounderSignature({ size = 'md' }) {
  const box = size === 'lg' ? 'w-24 h-24 md:w-28 md:h-28' : 'w-16 h-16 md:w-20 md:h-20'
  return (
    <div className="flex items-center gap-4 md:gap-5 not-prose">
      <span className={`${box} shrink-0 rounded-full p-[2px] bg-gradient-brand`}>
        <img
          src={img('lino-consulta-320.webp')}
          width="320"
          height="320"
          alt="Lino Consulta, founder of LinoCon Digital"
          loading="lazy"
          decoding="async"
          className="w-full h-full rounded-full object-cover"
        />
      </span>
      <span className="flex flex-col">
        <span className="font-display font-bold text-lg md:text-xl text-text">Lino Consulta</span>
        <span className="text-sm text-text-secondary">Founder, LinoCon Digital</span>
      </span>
    </div>
  )
}
