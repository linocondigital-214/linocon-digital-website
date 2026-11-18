import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright')
const N = Number(process.argv[2] || 300)
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } })
await pg.goto('file://' + process.cwd() + '/' + (process.argv[3] || 'hero-scene.html'))
const c = await pg.$('#c')
for (let i = 0; i < N; i++) {
  await pg.evaluate((p) => window.draw(p), i / N)
  await c.screenshot({ path: `frames/f${String(i).padStart(4, '0')}.png` })
}
await b.close()
