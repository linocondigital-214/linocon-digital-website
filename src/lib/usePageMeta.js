import { useEffect } from 'react'

export const DEFAULT_TITLE = 'LinoCon Digital | Websites & SEO in Vancouver, BC, Canada'

// While pages are prerendered at build time (see src/entry-server.jsx) effects
// don't run, so each page's title and description are recorded here instead.
let collected = null
export function collectPageMeta() {
  collected = { title: DEFAULT_TITLE, description: null }
  return collected
}

export const pageTitle = (title) => (title ? `${title} | LinoCon Digital` : DEFAULT_TITLE)

export default function usePageMeta(title, description) {
  if (collected) {
    collected.title = pageTitle(title)
    if (description) collected.description = description
  }

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    const prevDescription = meta?.getAttribute('content')
    document.title = pageTitle(title)
    if (meta && description) meta.setAttribute('content', description)
    return () => {
      document.title = DEFAULT_TITLE
      if (meta && prevDescription) meta.setAttribute('content', prevDescription)
    }
  }, [title, description])
}
