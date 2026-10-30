import { useEffect, useState } from 'react'

// True while the media query matches. Used to mount the desktop-only scroll
// scenes on desktop only: hiding them with CSS still built them on phones,
// and measuring the hidden horizontal track forced a full-page layout that
// froze mid-range phones for a few hundred milliseconds on load.
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
