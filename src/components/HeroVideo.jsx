import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// The homepage's moving background: flowing blue-to-orange light on the dark
// page. An original 10-second loop made for LinoCon (scripts/hero-video has
// the scene and how it was rendered).
//
// Kept light on purpose:
// - the still poster shows first, so the page never waits on the video;
// - the video only starts loading after the page has finished loading;
// - phones get a smaller copy (about 550 KB; the big one is about 1.5 MB);
// - it pauses when scrolled out of view, and never plays for visitors who
//   ask for less motion or have data saver on.
const base = `${import.meta.env.BASE_URL}videos/`

function wantsVideo() {
  const conn = navigator.connection
  if (conn?.saveData) return false
  if (conn && /(^|-)2g$/.test(conn.effectiveType || '')) return false
  return true
}

export default function HeroVideo() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [src, setSrc] = useState(null)
  const [playing, setPlaying] = useState(false)

  // Pick the right size once the page has loaded.
  useEffect(() => {
    if (reduce || !wantsVideo()) return
    const pick = () => setSrc(`${base}${window.matchMedia('(min-width: 768px)').matches ? 'hero-1600' : 'hero-960'}.mp4`)
    if (document.readyState === 'complete') {
      const id = setTimeout(pick, 300)
      return () => clearTimeout(id)
    }
    window.addEventListener('load', pick, { once: true })
    return () => window.removeEventListener('load', pick)
  }, [reduce])

  // Play only while the hero is on screen.
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
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={`${base}hero-poster-1920.webp`} />
        <img
          src={`${base}hero-poster-960.webp`}
          alt=""
          width="1920"
          height="1080"
          decoding="async"
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
      {/* Keeps the words readable and blends the bottom edge into the page. */}
      <div className="absolute inset-0 bg-ink/15" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-ink" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent" />
    </div>
  )
}
