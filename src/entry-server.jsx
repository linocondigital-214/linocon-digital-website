import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import App from './App.jsx'
import { collectPageMeta } from './lib/usePageMeta'
import { getService } from './lib/services'
import { getArticle } from './lib/articles'
import { getArea } from './lib/areaPages'

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
  const area = getArea(section)
  if (area && !slug) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          name: `Website design and SEO in ${area.city}, BC`,
          serviceType: 'Website design and SEO',
          description: area.metaDescription,
          url: SITE + url,
          provider: ORG,
          areaServed: {
            '@type': area.schemaType || 'City',
            name: area.label || area.city,
            containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' },
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: area.faq.map((q) => ({
            '@type': 'Question',
            name: q.title,
            acceptedAnswer: { '@type': 'Answer', text: q.body },
          })),
        },
        breadcrumbs({ name: `Web design in ${area.label || area.city}`, path: url }),
      ],
    }
  }
  if (url === '/who-we-work-with') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: 'Who we work with',
          url: SITE + url,
          about: ORG,
        },
        breadcrumbs({ name: 'Who we work with', path: url }),
      ],
    }
  }
  if (url === '/about') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          name: 'Our story',
          url: SITE + url,
          about: ORG,
          mainEntity: { '@id': `${SITE}/about#founder` },
        },
        {
          '@type': 'Person',
          '@id': `${SITE}/about#founder`,
          name: 'Lino Consulta',
          jobTitle: 'Founder',
          url: SITE + url,
          image: `${SITE}/images/lino-consulta-640.webp`,
          worksFor: ORG,
        },
        breadcrumbs({ name: 'Our story', path: url }),
      ],
    }
  }
  return null
}
