const PATHS = {
  dashboard: 'M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z',
  income: 'M12 4v11m0 0-4-4m4 4 4-4M5 20h14',
  invoice: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  expense: 'M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21zM10 8h4M10 12h4',
  gst: 'M5 20V10M10 20V4M15 20v-7M20 20H3',
  export: 'M12 15V4m0 0L8 8m4-4 4 4M5 14v6h14v-6',
  access: 'M14.5 9.5a4 4 0 1 1-1.2-2.8M14 10l6 6m-3-3 2-2m-5 5 2-2',
  plus: 'M12 5v14M5 12h14',
}

export default function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
