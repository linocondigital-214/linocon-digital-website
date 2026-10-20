import { useEffect, useState } from 'react'
import { strToU8, zipSync } from 'fflate'
import { fetchExport, fetchReceipt, money, shortDate } from '../../lib/finance'
import { workbook, yearTotals } from '../../lib/financeReport'
import { downloadBlob } from '../../lib/xlsx'

// /finance/export: a year's books for an accountant, as an Excel workbook,
// a one-page PDF summary (the browser's Save as PDF) and the receipts (photos and PDFs).
export default function Export() {
  const [year, setYear] = useState(null)
  const [data, setData] = useState({ status: 'loading' })
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchExport(year)
      .then((d) => setData({ status: 'ready', ...d }))
      .catch(() => setData({ status: 'error' }))
  }, [year])

  if (data.status === 'loading') return <p className="text-fin-muted">Loading...</p>
  if (data.status === 'error') return <p className="text-fin-muted">Couldn't load your books. Please refresh the page.</p>

  const t = yearTotals(data)
  const name = `LinoCon-Digital-Books-${data.year}`

  function excel() {
    setError('')
    downloadBlob(workbook(data), `${name}.xlsx`)
  }

  async function receipts() {
    setError('')
    setBusy('receipts')
    try {
      const files = {}
      const withPhoto = data.expenses.filter((e) => e.receipt)
      // A few at a time, so a phone on mobile data isn't flooded.
      for (let i = 0; i < withPhoto.length; i += 4) {
        const batch = withPhoto.slice(i, i + 4)
        const photos = await Promise.all(batch.map((e) => fetchReceipt(e.id)))
        batch.forEach((e, n) => {
          const [head, body] = photos[n].split(',')
          const ext = head.includes('pdf') ? 'pdf' : head.includes('png') ? 'png' : 'jpg'
          const label = `${e.date} ${e.vendor} ${(e.amount / 100).toFixed(2)}`.replace(/[^\w .-]+/g, '').slice(0, 80)
          let file = `${label}.${ext}`
          for (let k = 2; files[file]; k++) file = `${label} (${k}).${ext}`
          files[file] = Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
        })
      }
      files['About these receipts.txt'] = strToU8(
        `Receipts for LinoCon Digital, ${data.year}. Each file is named date, vendor and total paid.\n`,
      )
      downloadBlob(new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' }), `${name}-Receipts.zip`)
    } catch {
      setError('Some receipts couldn’t be downloaded. Please try again.')
    }
    setBusy('')
  }

  return (
    <div className="max-w-4xl">
      <div className="no-print">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">For your accountant</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl pt-1">Export</h1>
        <div className="text-fin-muted mt-2 max-w-xl">Everything for one year, ready to send. Pick the year, then download what your accountant asks for.</div>

        <label className="mt-6 flex items-center gap-3 text-sm font-medium">
          Year
          <select
            value={data.year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-11 rounded-xl bg-fin-panel-2 border border-fin-line px-3 text-text outline-none focus:border-fin-blue"
          >
            {data.years
              .filter((y) => y <= Number(data.today.slice(0, 4)))
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>
          {t.open && <span className="text-fin-muted font-normal">This year so far</span>}
        </label>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <Choice title="Excel workbook" text="Every entry, by category, invoices, GST and the balance sheet. Opens in Excel or Google Sheets." action="Download Excel" onClick={excel} />
          <Choice title="PDF summary" text="The year on one page. Choose Save as PDF when the print window opens." action="Save as PDF" onClick={() => window.print()} />
          <Choice
            title="Receipts"
            text={t.receipts ? `${t.receipts} ${t.receipts === 1 ? 'receipt' : 'receipts'} (photos and PDFs) in one zip file.` : 'No receipts for this year yet.'}
            action={busy === 'receipts' ? 'Preparing...' : 'Download receipts'}
            disabled={!t.receipts || busy === 'receipts'}
            onClick={receipts}
          />
        </div>
        {error && <div className="mt-4 text-sm text-fin-bad">{error}</div>}
        {t.missingReceipts > 0 && (
          <div className="mt-4 text-sm text-fin-warn">
            {t.missingReceipts} {t.missingReceipts === 1 ? 'expense has' : 'expenses have'} no receipt. Add them in Expenses before you send.
          </div>
        )}

        <div className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-fin-muted">Preview of the PDF</div>
      </div>

      <Summary data={data} totals={t} />
    </div>
  )
}

function Choice({ title, text, action, onClick, disabled }) {
  return (
    <div className="rounded-2xl border border-fin-line bg-fin-panel p-5 flex flex-col">
      <div className="font-display font-bold text-lg">{title}</div>
      <div className="text-sm text-fin-muted mt-1 mb-4 flex-1">{text}</div>
      <button type="button" onClick={onClick} disabled={disabled} className="h-11 rounded-full fin-grad text-white text-sm font-bold disabled:opacity-50">
        {action}
      </button>
    </div>
  )
}

// The one-page year summary. White paper on screen and on the printed page.
function Summary({ data, totals: t }) {
  const { year, yearEnd: y, balance, gst, settings } = data
  return (
    <article className="print-paper mt-3 rounded-2xl bg-white text-[#111827] p-6 md:p-10 text-sm leading-relaxed">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5e7eb] pb-5">
        <div>
          <div className="font-display font-bold text-2xl">LinoCon Digital</div>
          <div className="text-[#4b5563]">Vancouver, BC · linocondigital.com</div>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-xl">Books for {year}</div>
          <div className="text-[#4b5563]">
            {t.open ? `So far, to ${shortDate(data.today)}` : `Year ended Dec 31, ${year}`} · Cash basis
          </div>
          <div className="text-[#4b5563]">{settings.gstNumber ? `GST ${settings.gstNumber}` : settings.gstRegistered ? 'Registered for GST' : 'Not registered for GST'}</div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 mt-6 print:grid-cols-2">
        <Block title="Profit">
          <Line label="Revenue (before GST)" value={y.revenue} />
          <Line label="Expenses (after GST claimed back)" value={y.expenses} />
          <Line label="Profit" value={y.profit} strong />
          <Line label="Owner took out" value={y.ownerOut} />
        </Block>
        <Block title="Cash in the bank">
          <Line label="Opening cash" value={y.opening} />
          <Line label="Money in" value={y.cashIn} />
          <Line label="Money out" value={y.cashOut} />
          <Line label={t.open ? 'Cash today' : 'Closing cash'} value={y.closing} strong />
        </Block>
        <Block title="Income by service">
          {t.byService.length ? t.byService.map((s) => <Line key={s.name} label={s.name} value={s.amount} />) : <Empty />}
        </Block>
        <Block title="Expenses by category">
          {t.byCategory.length ? t.byCategory.map((c) => <Line key={c.name} label={c.name} value={c.cost} />) : <Empty />}
        </Block>
        <Block title={t.open ? `Balance sheet, ${shortDate(balance.date)}` : `Balance sheet, Dec 31`}>
          <Line label="Cash in the bank" value={balance.cash} />
          <Line label="Unpaid invoices" value={balance.owedToYou} />
          {balance.equipment > 0 && <Line label="Equipment" value={balance.equipment} />}
          <Line label="Total owned" value={balance.assets} strong />
          <Line label="GST owing" value={balance.gst} />
          <Line label="Credit card" value={balance.card} />
          <Line label="Loans" value={balance.loans} />
          {balance.other > 0 && <Line label="Other" value={balance.other} />}
          <Line label="Total owed" value={balance.liabilities} strong />
          <Line label="Owner’s equity" value={balance.equity} strong />
        </Block>
        <Block title="GST">
          {settings.gstRegistered ? (
            <>
              <Line label="Sales (line 101)" value={gst.full.sales} />
              <Line label="GST charged (line 105)" value={gst.full.charged} />
              <Line label="GST claimed back (line 108)" value={gst.full.credits} />
              <Line label="Net for the year (line 109)" value={gst.full.net} strong />
              <Line label="Still owing at year end" value={y.gstOwing} />
            </>
          ) : (
            <div className="text-[#4b5563]">Not registered for GST, so none was charged or claimed. Sales for the year: {money(gst.full.sales)}.</div>
          )}
        </Block>
      </div>

      <div className="mt-8 pt-4 border-t border-[#e5e7eb] text-xs text-[#6b7280]">
        {data.income.length} income {data.income.length === 1 ? 'entry' : 'entries'}, {data.expenses.length}{' '}
        {data.expenses.length === 1 ? 'expense' : 'expenses'}, {data.invoices.length} {data.invoices.length === 1 ? 'invoice' : 'invoices'}. Every entry is
        in the Excel workbook. Prepared {shortDate(data.today)} from LinoCon Books.
      </div>
    </article>
  )
}

function Block({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="font-display font-bold text-base border-b border-[#e5e7eb] pb-1.5 mb-2">{title}</h2>
      {children}
    </section>
  )
}

function Line({ label, value, strong }) {
  return (
    <div className={`flex justify-between gap-4 py-0.5 ${strong ? 'font-bold' : ''}`}>
      <span>{label}</span>
      <span className="tabular-nums">{money(value)}</span>
    </div>
  )
}

const Empty = () => <div className="text-[#6b7280]">Nothing yet.</div>
