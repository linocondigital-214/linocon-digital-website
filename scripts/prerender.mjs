// Runs after `vite build`. Saves every public page listed in public/sitemap.xml
// as its own HTML file (dist/services/seo-setup/index.html and so on) with the
// page's own title, description, canonical address and text already in it.
// Vercel serves these files first; anything else still falls back to the
// normal index.html, so the site keeps working exactly as before.
import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { build } from 'vite'

const SITE = 'https://linocondigital.com'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrOut = path.join(root, 'dist-ssr')

await build({
  root,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.jsx', outDir: ssrOut, emptyOutDir: true, copyPublicDir: false },
})
const { render, pageSchema } = await import(path.join(ssrOut, 'entry-server.js'))

const template = await readFile(path.join(dist, 'index.html'), 'utf8')
const sitemap = await readFile(path.join(root, 'public/sitemap.xml'), 'utf8')

// Articles with a future date (or draft: true) are left out of the sitemap Google
// reads and are not saved as HTML, so Google never sees an "Article not found"
// page. The site rebuilds each morning (.github/workflows/rebuild.yml), which
// adds each article on its publish day.
const articleDir = path.join(root, 'src/content/articles')
const upcoming = new Set()
for (const name of await readdir(articleDir)) {
  if (!name.endsWith('.md')) continue
  const raw = await readFile(path.join(articleDir, name), 'utf8')
  const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  const field = (key) => front.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]*)`, 'm'))?.[1].trim()
  const date = Date.parse(field('date') || '1970-01-01')
  if (field('draft') === 'true' || !(date <= Date.now())) upcoming.add(`/articles/${name.replace(/\.md$/, '')}`)
}

// Pages that still work for visitors but are kept out of Google search.
const NOINDEX = new Set(['/card'])

const routeOf = (loc) => loc.replace(SITE, '') || '/'
const liveSitemap = sitemap.replace(/\s*<url>\s*<loc>([^<]*)<\/loc>[\s\S]*?<\/url>/g, (block, loc) =>
  upcoming.has(routeOf(loc)) || NOINDEX.has(routeOf(loc)) ? '' : block,
)
await writeFile(path.join(dist, 'sitemap.xml'), liveSitemap)

const routes = [...sitemap.matchAll(/<loc>https:\/\/linocondigital\.com([^<]*)<\/loc>/g)]
  .map((m) => m[1] || '/')
  .filter((route) => !upcoming.has(route))

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`)
  return html.replace(re, `$1${escapeAttr(value)}$2`)
}

let failed = 0
for (const route of routes) {
  try {
    const { html, title, description } = await render(route)
    const url = SITE + route
    let page = template
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeText(title)}</title>`)
      .replace('</head>', `  <link rel="canonical" href="${url}" />\n  </head>`)
    if (NOINDEX.has(route)) page = page.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
    page = setMeta(page, 'property', 'og:title', title)
    page = setMeta(page, 'property', 'og:url', url)
    page = setMeta(page, 'name', 'twitter:title', title)
    if (description) {
      page = setMeta(page, 'name', 'description', description)
      page = setMeta(page, 'property', 'og:description', description)
      page = setMeta(page, 'name', 'twitter:description', description)
    }
    const schema = pageSchema(route)
    if (schema) {
      const json = JSON.stringify(schema).replace(/</g, '\\u003c')
      page = page.replace('</head>', `  <script type="application/ld+json">${json}</script>\n  </head>`)
    }
    // The page goes in after the loading logo, which stays on top until the
    // site's code takes over, so visitors see no change.
    page = page.replace(/(<div id="splash"[\s\S]*?<\/svg>\s*<\/div>)/, `$1${html}`)

    const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route, 'index.html')
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, page)
  } catch (err) {
    failed++
    console.error(`prerender: ${route} failed, it will load the normal way.`, err)
  }
}

await rm(ssrOut, { recursive: true, force: true })
console.log(`prerender: ${routes.length - failed} of ${routes.length} pages saved as HTML`)
if (upcoming.size) console.log(`prerender: ${upcoming.size} upcoming article(s) left out until their date`)
