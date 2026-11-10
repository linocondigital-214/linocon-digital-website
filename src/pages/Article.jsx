import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { articles, getArticle, formatDate } from '../lib/articles'
import usePageMeta from '../lib/usePageMeta'

export default function Article() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const article = getArticle(slug, { preview: searchParams.has('preview') })
  usePageMeta(article?.title ?? 'Article not found', article?.description)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // A missing or not-yet-published article tells Google not to save the page.
  useEffect(() => {
    if (article) return
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [article])

  if (!article) {
    return (
      <section className="min-h-screen pt-40 pb-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <h1 className="font-display font-bold text-4xl">Article not found</h1>
          <p className="text-text-secondary mt-4">
            It may have moved.{' '}
            <Link to="/articles" className="text-text underline">
              See all articles
            </Link>
            .
          </p>
        </div>
      </section>
    )
  }

  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 2)

  return (
    <article className="min-h-screen pt-40 pb-28">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <Link to="/articles" className="text-sm font-semibold text-text-secondary hover:text-text">
          &larr; All articles
        </Link>

        <header className="mt-6 mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
            {article.category} &middot; {article.minutes} min read &middot; {formatDate(article.date)}
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mt-4">
            {article.title}
          </h1>
          {article.description && (
            <p className="text-lg text-text-secondary mt-4">{article.description}</p>
          )}
        </header>

        {article.image && (
          <img
            src={`${article.image}-1600.webp`}
            srcSet={`${article.image}-800.webp 800w, ${article.image}-1600.webp 1600w`}
            sizes="(min-width: 768px) 672px, 100vw"
            width="1600"
            height="837"
            alt={article.imageAlt}
            className="w-full h-auto rounded-2xl border border-border mb-12"
          />
        )}

        <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.html }} />

        <div className="mt-16 rounded-2xl border border-border bg-surface p-8 md:p-10 flex flex-col gap-5">
          <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight">
            Want this handled for you?
          </h2>
          <p className="text-text-secondary">
            Book a free strategy call and we&#39;ll show you exactly where your website and SEO
            have room to grow.
          </p>
          <Link
            to="/book"
            className="self-start flex items-center h-12 px-7 rounded-full bg-gradient-brand text-ink text-sm font-bold"
          >
            Book a Strategy Call
          </Link>
        </div>

        {more.length > 0 && (
          <div className="mt-16">
            <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
              Keep reading
            </span>
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              {more.map((a) => (
                <Link
                  key={a.slug}
                  to={`/articles/${a.slug}`}
                  className="rounded-2xl border border-border p-6 hover:border-blue transition-colors"
                >
                  <h3 className="font-display font-bold text-lg leading-snug">{a.title}</h3>
                  <span className="text-sm text-text-tertiary mt-2 block">{a.minutes} min read</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
