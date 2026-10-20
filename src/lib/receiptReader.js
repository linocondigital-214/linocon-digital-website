// Reads the words on a receipt, on the device: a PDF's own text, or the
// text in a photo or screenshot (Tesseract). Nothing is sent anywhere, and
// the reading tools come from this site, not another one. They load only
// when a receipt is added, so the app stays quick.

// Rebuilds a PDF page's lines from its words, top to bottom, left to right.
function pageLines(items) {
  const rows = []
  for (const item of items) {
    if (!item.str?.trim()) continue
    const y = item.transform[5]
    let row = rows.find((r) => Math.abs(r.y - y) < 3)
    if (!row) rows.push((row = { y, words: [] }))
    row.words.push({ x: item.transform[4], s: item.str })
  }
  return rows
    .sort((a, b) => b.y - a.y)
    .map((r) =>
      r.words
        .sort((a, b) => a.x - b.x)
        .map((w) => w.s)
        .join(' '),
    )
}

async function pdfText(file) {
  // The "legacy" build also works on phones a version or two behind.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { default: workerSrc } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
  const loading = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  try {
    const pdf = await loading.promise
    const lines = []
    for (let n = 1; n <= Math.min(pdf.numPages, 3); n++) {
      const page = await pdf.getPage(n)
      lines.push(...pageLines((await page.getTextContent()).items))
    }
    if (lines.join('').length > 20) return lines.join('\n')
    // A scanned PDF has no text of its own: read the first page as a picture.
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise
    return photoText(canvas.toDataURL('image/png'))
  } finally {
    loading.destroy()
  }
}

async function photoText(image) {
  const [{ createWorker }, { default: workerPath }, { default: corePath }] = await Promise.all([
    import('tesseract.js'),
    import('tesseract.js/dist/worker.min.js?url'),
    // The SIMD build runs on every current phone and computer browser.
    import('tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url'),
  ])
  // English reading data (public/ocr/eng.traineddata.gz), kept on the device after the first time.
  const worker = await createWorker('eng', 1, { workerPath, corePath, langPath: '/ocr', gzip: true })
  try {
    return (await worker.recognize(image)).data.text
  } finally {
    await worker.terminate()
  }
}

// file: what Lino picked; image: the shrunk photo the app saves (or null for a PDF).
export function receiptText(file, image) {
  return image ? photoText(image) : pdfText(file)
}
