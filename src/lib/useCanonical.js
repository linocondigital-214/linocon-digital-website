import { useEffect } from 'react'

const SITE = 'https://linocondigital.com'

// Tells Google the one address each page should be indexed under: the main
// domain (no www), no trailing slash, no ?query. Must match public/sitemap.xml.
export default function useCanonical(pathname) {
  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/'
    link.href = SITE + path
  }, [pathname])
}
