import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import App from './App.jsx'
import { collectPageMeta } from './lib/usePageMeta'
import { getService } from './lib/services'
import { getArticle } from './lib/articles'

// Used only at build time by scripts/prerender.mjs: renders one public page to
// plain HTML so Google gets the page's own title, description and text in the
// first download instead of an empty page.
export async function render(url) {
  const meta = collectPageMeta()
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <LazyMotion features={domAnimation} strict>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </LazyMotion>
    </StrictMode>,
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  return { html, title: meta.title, description: meta.description }
}

const SITE = 'https://linocondigital.com'
const ORG = { '@id': `${SITE}/#organization` }

function breadcrumbs(...items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: SITE + item.path,
    })),
  }
}

// Extra structured data for Google on service and article pages: what the
// page is, who offers or wrote it, and where it sits in the site.
export function pageSchema(url) {
  const [, section, slug] = url.split('/')
  if (section === 'services' && slug) {
    const s = getService(slug)
    if (!s) return null
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          name: s.name,
          serviceType: s.name,
          description: s.metaDescription,
          url: SITE + url,
          provider: ORG,
          areaServed: [
            { '@type': 'Country', name: 'Canada' },
            { '@type': 'Country', name: 'United States' },
          ],
        },
        breadcrumbs({ name: s.name, path: url }),
      ],
    }
  }
  if (section === 'articles' && slug) {
    const a = getArticle(slug, { preview: true })
    if (!a) return null
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: a.title,
          description: a.description,
          datePublished: a.date,
          ...(a.image && { image: `${SITE}${a.image}-1600.webp` }),
          author: ORG,
          publisher: ORG,
          mainEntityOfPage: SITE + url,
        },
        breadcrumbs({ name: 'Articles', path: '/articles' }, { name: a.title, path: url }),
      ],
    }
  }
  return null
}
