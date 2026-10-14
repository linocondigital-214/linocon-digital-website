import { useState } from 'react'
import { clientLink } from '../../lib/clientProgress'

export default function CopyLinkButton({ id }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(clientLink(id))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the client link:', clientLink(id))
    }
  }
  return (
    <button type="button" onClick={copy} className="h-11 px-5 rounded-full border border-border text-sm font-semibold hover:border-text-tertiary">
      {copied ? 'Link copied' : 'Copy client link'}
    </button>
  )
}
