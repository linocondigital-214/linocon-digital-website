import { useEffect } from 'react'
import { GA_ID, markInternalVisitor } from './analytics'

// Pages only for Lino, a bookkeeper or signed-in clients.
const PRIVATE = /^\/(admin|finance|clients|progress)(\/|$)/
// Pages only Lino (and a bookkeeper) use: never counted in Analytics.
const OWNER_ONLY = /^\/(admin|finance)(\/|$)/

// Keeps private pages out of Google (a "noindex" tag), and keeps Lino's own
// admin and finance work out of the visitor numbers in Google Analytics.
export default function usePrivatePage(pathname) {
  const isPrivate = PRIVATE.test(pathname)
  const ownerOnly = OWNER_ONLY.test(pathname)

  useEffect(() => {
    if (!isPrivate) return
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [isPrivate])

  useEffect(() => {
    if (ownerOnly) markInternalVisitor()
    // index.html turns Analytics off on preview addresses (vercel.app) and on
    // the admin and finance pages; this keeps that right while moving around.
    window[`ga-disable-${GA_ID}`] = Boolean(window.__lcAnalyticsOff) || ownerOnly
  }, [ownerOnly])
}
