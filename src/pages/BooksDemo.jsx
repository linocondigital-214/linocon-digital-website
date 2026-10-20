import usePageMeta from '../lib/usePageMeta'
import { useNoIndex } from '../lib/clientProgress'

// Clickable LinoCon Books demo with sample data. The screens live in
// public/demo/books.html; this page shows them full screen at /books/demo.
export default function BooksDemo() {
  usePageMeta(
    'LinoCon Books Demo',
    'Try LinoCon Books with sample data: dashboard, invoices, expenses, GST and year-end.',
  )
  useNoIndex()

  return (
    <iframe
      src="/demo/books.html"
      title="LinoCon Books demo"
      className="fixed inset-0 w-full h-full border-0 bg-ink"
    />
  )
}
