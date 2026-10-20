// Six-digit sign-in codes from an authenticator app (Google Authenticator,
// Microsoft Authenticator, 1Password...), the standard TOTP method (RFC 6238).
// Free, works offline, and needs no SMS or email account.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP = 30

export function newSecret() {
  return base32(randomBytes(20))
}

function base32(buf) {
  let bits = ''
  for (const byte of buf) bits += byte.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i < bits.length; i += 5) out += ALPHABET[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)]
  return out
}

function fromBase32(text) {
  let bits = ''
  for (const ch of text.replace(/=+$/, '').toUpperCase()) {
    const v = ALPHABET.indexOf(ch)
    if (v < 0) throw new Error('Bad secret')
    bits += v.toString(2).padStart(5, '0')
  }
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP)

export function codeAt(secret, step) {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const hmac = createHmac('sha1', fromBase32(secret)).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const value = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return String(value).padStart(6, '0')
}

// Returns the time step the code belongs to (allowing one step of clock
// drift either way), or null. The caller refuses steps already used, so a
// code can't be replayed.
export function matchStep(secret, code, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null
  const step = currentStep(now)
  for (const s of [step, step - 1, step + 1]) {
    if (timingSafeEqual(Buffer.from(codeAt(secret, s)), Buffer.from(code))) return s
  }
  return null
}

export const otpauthUrl = (secret, account = 'Owner') =>
  `otpauth://totp/${encodeURIComponent(`LinoCon Books:${account.replace(/:/g, ' ')}`)}?secret=${secret}&issuer=${encodeURIComponent('LinoCon Books')}&period=${STEP}&digits=6`
