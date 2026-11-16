import { marked } from 'marked'

// Every .md file in src/content/articles becomes an article. The file name is the URL slug.
const files = import.meta.glob('../content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (key) data[key] = value
  }
  return { data, body: match[2] }
}

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

const all = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '')
    const { data, body } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      category: data.category || 'Guides',
      date: data.date || '1970-01-01',
      // Optional: the day an article was last changed a lot, for Google.
      updated: data.updated || '',
      image: data.image || '',
      imageAlt: data.imageAlt || '',
      draft: data.draft === 'true',
      minutes: readingTime(body),
      html: marked.parse(body),
    }
  })
  .filter((a) => !a.draft)
  .sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : b.date.localeCompare(a.date)))

// Scheduled articles appear on their own once their date and time has passed, checked in the
// visitor's browser, so no redeploy is needed. A date can include a time and zone,
// e.g. 2026-10-13T09:00:00-07:00 (9 AM Pacific).
function isPublished(article) {
  return Date.parse(article.date) <= Date.now()
}

export const articles = all.filter(isPublished)

// Adding ?preview to an article's URL shows it before its publish date.
export function getArticle(slug, { preview = false } = {}) {
  return all.find((a) => a.slug === slug && (preview || isPublished(a)))
}

export function formatDate(date) {
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
