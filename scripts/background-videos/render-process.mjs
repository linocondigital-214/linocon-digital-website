// node render-process.mjs <scene> [frames]  -> frames-<scene>/f0000.png ...
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const [s, N = 240] = [process.argv[2], Number(process.argv[3] || 240)]
const dir = `frames-${s}`; mkdirSync(dir, { recursive: true })
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1040, height: 840 } })
await pg.goto('file://' + process.cwd() + '/process-scene.html?s=' + s)
const c = await pg.$('#c')
for (let i = 0; i < N; i++) { await pg.evaluate((p) => window.draw(p), i / N); await c.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.png` }) }
await b.close()
