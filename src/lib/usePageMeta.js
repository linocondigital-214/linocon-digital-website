import { useEffect } from 'react'

const DEFAULT_TITLE = 'LinoCon Digital | Websites & SEO in Vancouver, BC, Canada'

export default function usePageMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    const prevDescription = meta?.getAttribute('content')
    document.title = title ? `${title} | LinoCon Digital` : DEFAULT_TITLE
    if (meta && description) meta.setAttribute('content', description)
    return () => {
      document.title = DEFAULT_TITLE
      if (meta && prevDescription) meta.setAttribute('content', prevDescription)
    }
  }, [title, description])
}
