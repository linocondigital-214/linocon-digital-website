import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// Moving backgrounds for the homepage, each an original 10-second loop made
// for LinoCon (scripts/background-videos has the scenes and how they were
// rendered):
//   hero   flowing blue-to-orange light, behind the top headline
//   found  grey dots (sites nobody finds) lit up one by one, behind the
//          "Most small business websites look fine…" statement
//   process-audit|plan|build|grow  one per card in "A system, not a
//          scramble." (about 130 KB each, 60 KB on phones)
//
// Kept light on purpose:
// - the still poster shows first, so the page never waits on a video;
// - the hero video only starts loading after the page has loaded, and the
//   others only once the visitor scrolls close to them (`lazy`);
// - phones get a smaller copy (hero about 550 KB, found about 150 KB);
// - each pauses when out of view, and none plays for visitors who ask for
//   less motion or have data saver on.
const base = `${import.meta.env.BASE_URL}videos/`

function wantsVideo() {
  const conn = navigator.connection
  if (conn?.saveData) return false
  if (conn && /(^|-)2g$/.test(conn.effectiveType || '')) return false
  return true
}


// Sizes: the video is <name>-<big|small>.mp4 and the poster
// <name>-poster-<posterBig|posterSmall>.webp; phones get the small ones.
export default function BackgroundVideo({
  name,
  lazy = false,
  tint = 'bg-ink/15',
  fadeTop = true,
  fadeBottom = true,
  big = 1600,
  small = 960,
  posterBig = 1920,
  posterSmall = 960,
  className = '',
}) {
  const reduce = useReducedMotion()
  const box = useRef(null)
  const ref = useRef(null)
  const [src, setSrc] = useState(null)
  const [playing, setPlaying] = useState(false)

  // When to load: after the page has loaded, or (lazy) when scrolled near.
  useEffect(() => {
    if (reduce || !wantsVideo()) return
    const pick = () => setSrc(`${base}${name}-${window.matchMedia('(min-width: 768px)').matches ? big : small}.mp4`)
    if (lazy) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            pick()
            io.disconnect()
          }
        },
        { rootMargin: '600px' },
      )
      io.observe(box.current)
      return () => io.disconnect()
    }
    if (document.readyState === 'complete') {
      const id = setTimeout(pick, 300)
      return () => clearTimeout(id)
    }
    window.addEventListener('load', pick, { once: true })
    return () => window.removeEventListener('load', pick)
  }, [reduce, lazy, name, big, small])

  // Play only while on screen.
  useEffect(() => {
    const v = ref.current
    if (!v || !src) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [src])

  return (
    <div ref={box} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <picture>
        <source media="(min-width: 768px)" srcSet={`${base}${name}-poster-${posterBig}.webp`} />
        <img
          src={`${base}${name}-poster-${posterSmall}.webp`}
          alt=""
          width="1920"
          height="1080"
          decoding="async"
          loading={lazy ? 'lazy' : undefined}
          fetchPriority="low"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </picture>
      {src && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${playing ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {/* Keeps the words readable and blends the edges into the page. */}
      {tint && <div className={`absolute inset-0 ${tint}`} />}
      {fadeBottom && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-ink" />}
      {fadeTop && <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent" />}
    </div>
  )
}
