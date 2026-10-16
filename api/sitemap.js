// /sitemap.xml (rewritten here in vercel.json): the list of public pages
// Google should index. Built on each request so a scheduled article joins
// the sitemap at its publish time, the same moment it appears on the site.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const SITE = 'https://linocondigital.com'

// Fixed pages. Every address here must load directly, with no redirect,
// and match the page's canonical tag (no trailing slash).
const PAGES = [
  ['/', '2026-10-15'],
  ['/book', '2026-10-10'],
  ['/services/website-creation', '2026-10-15'],
  ['/services/seo-setup', '2026-10-15'],
  ['/services/backlink-building', '2026-10-15'],
  ['/process/audit', '2026-10-14'],
  ['/process/plan', '2026-10-14'],
  ['/process/build-and-launch', '2026-10-14'],
  ['/process/grow', '2026-10-14'],
]

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles')

// Same rules as src/lib/articles.js: drafts and future-dated posts stay out.
async function publishedArticles() {
  const files = (await readdir(ARTICLES_DIR)).filter((f) => f.endsWith('.md'))
  const articles = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(ARTICLES_DIR, file), 'utf8')
      const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
      const field = (key) =>
        front.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1].trim().replace(/^["']|["']$/g, '')
      return { slug: file.replace(/\.md$/, ''), date: field('date') || '', draft: field('draft') === 'true' }
    }),
  )
  return articles
    .filter((a) => !a.draft && a.date && Date.parse(a.date) <= Date.now())
    .sort((a, b) => b.date.localeCompare(a.date))
}

const url = (loc, lastmod) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`

export default async function handler(req, res) {
  let articles = []
  try {
    articles = await publishedArticles()
  } catch (err) {
    // Still serve the fixed pages if the article files can't be read.
    console.error('sitemap: could not read articles', err)
  }
  const entries = PAGES.map(([loc, lastmod]) => url(loc, lastmod))
  if (articles.length) {
    entries.push(url('/articles', new Date(articles[0].date).toISOString().slice(0, 10)))
    for (const a of articles) entries.push(url(`/articles/${a.slug}`, new Date(a.date).toISOString().slice(0, 10)))
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600')
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
  )
}
