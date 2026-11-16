import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import usePageMeta from '../lib/usePageMeta'
import { track } from '../lib/analytics'

const LINKS = [
  { to: '/', label: 'Home page' },
  { to: '/services/website-creation', label: 'Website Creation' },
  { to: '/services/seo-setup', label: 'SEO Setup' },
  { to: '/articles', label: 'Articles' },
  { to: '/book', label: 'Book a free call' },
]

// Shown for any address the site doesn't have (a typo or an old link).
// It tells Google not to save the page, so these never show up in search as a
// copy of the home page, and it tells Analytics which address was broken.
export default function NotFound() {
  const { pathname } = useLocation()
  usePageMeta('Page not found', 'This page does not exist. Find website, SEO and backlink help from LinoCon Digital.')

  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex'
    document.head.appendChild(tag)
    track('page_not_found', { page_path: pathname.slice(0, 100) })
    return () => tag.remove()
  }, [pathname])

  return (
    <section className="min-h-screen pt-40 pb-28">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <span className="text-sm font-bold tracking-widest uppercase text-orange">Error 404</span>
        <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mt-4">Page not found</h1>
        <p className="text-lg text-text-secondary mt-4">
          This page doesn&rsquo;t exist or has moved. These might help:
        </p>
        <ul className="mt-8 flex flex-col gap-3">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="text-text underline font-semibold">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
