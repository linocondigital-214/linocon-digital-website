// Two-step sign-in for the finance app: the FINANCE_PASSWORD set in Vercel,
// then a 6-digit code from an authenticator app. The first sign-in links the
// app (QR code) and hands out one-time recovery codes for a lost phone.
//
// The owner can also invite one bookkeeper (see roles.js for what they can
// do). The invite is a one-time code, good for 7 days; the bookkeeper picks
// their own password and links their own authenticator app with it. Removing
// the bookkeeper ends their sessions at once.
//
// Sessions live in Redis behind an HttpOnly cookie: they end after 30
// minutes without activity and 12 hours at most. Five wrong tries from one
// connection (or 20 overall) lock sign-in for 15 minutes.
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { redis, SetupError } from '../store.js'
import { matchStep, newSecret } from './totp.js'

const IDLE_SECONDS = 30 * 60
const MAX_SESSION_MS = 12 * 60 * 60 * 1000
const PENDING_SECONDS = 5 * 60
const LOCK_SECONDS = 15 * 60
const MAX_TRIES = 5
const MAX_TRIES_ALL = 20
const COOKIE = 'lcd_fin'
const INVITE_DAYS = 7
const MIN_PASSWORD = 12

const sha = (value) => createHash('sha256').update(String(value)).digest()
const hashKey = (token) => sha(token).toString('hex')
const token = () => randomBytes(32).toString('base64url')

const KEYS = {
  totp: 'fin:totp',
  lastStep: 'fin:totp:last',
  recovery: 'fin:recovery',
  pending: (t) => `fin:pending:${hashKey(t)}`,
  session: (t) => `fin:session:${hashKey(t)}`,
  fails: (ip) => `fin:fails:${ip}`,
  failsAll: 'fin:fails:all',
  bookkeeper: 'fin:bk',
  bookkeeperLastStep: 'fin:bk:last',
  invite: 'fin:bk:invite',
}

const passwordHash = (password, salt) => scryptSync(String(password), salt, 32).toString('hex')
const samePassword = (password, salt, hash) =>
  typeof password === 'string' && password.length > 0 && timingSafeEqual(Buffer.from(passwordHash(password, salt), 'hex'), Buffer.from(hash, 'hex'))

const getJson = async (key) => {
  const raw = await redis(['GET', key])
  return raw ? JSON.parse(raw) : null
}

export function checkSetup() {
  if (!process.env.FINANCE_PASSWORD) throw new SetupError('FINANCE_PASSWORD is not set')
}

export const isEnrolled = async () => Boolean(await redis(['GET', KEYS.totp]))

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()
  return (fwd || req.socket?.remoteAddress || 'unknown').slice(0, 64)
}

async function isLocked(req) {
  const [mine, all] = await Promise.all([redis(['GET', KEYS.fails(clientIp(req))]), redis(['GET', KEYS.failsAll])])
  return Number(mine ?? 0) >= MAX_TRIES || Number(all ?? 0) >= MAX_TRIES_ALL
}

async function countFailure(req) {
  for (const key of [KEYS.fails(clientIp(req)), KEYS.failsAll]) {
    const n = await redis(['INCR', key])
    if (n === 1) await redis(['EXPIRE', key, LOCK_SECONDS])
  }
}

// Step 1: the password. Returns a short-lived ticket for step 2 and, on the
// very first sign-in, a new authenticator secret to link.
export async function startSignIn(req, password) {
  checkSetup()
  if (await isLocked(req)) return { status: 'locked' }
  const expected = process.env.FINANCE_PASSWORD
  const ok = typeof password === 'string' && password.length > 0 && timingSafeEqual(sha(password), sha(expected))
  if (!ok) {
    const bookkeeper = await getJson(KEYS.bookkeeper)
    if (bookkeeper && samePassword(password, bookkeeper.salt, bookkeeper.hash)) {
      const ticket = token()
      await redis(['SET', KEYS.pending(ticket), JSON.stringify({ role: 'bookkeeper', bookkeeperId: bookkeeper.id, secret: null }), 'EX', PENDING_SECONDS])
      return { status: 'ok', ticket, enroll: false, secret: null }
    }
    await countFailure(req)
    return { status: 'wrong' }
  }
  const ticket = token()
  const enrolled = await isEnrolled()
  const pending = { role: 'owner', secret: enrolled ? null : newSecret() }
  await redis(['SET', KEYS.pending(ticket), JSON.stringify(pending), 'EX', PENDING_SECONDS])
  return { status: 'ok', ticket, enroll: !enrolled, secret: pending.secret }
}

// Step 2: the 6-digit code (or a recovery code). Returns a session token, and
// the recovery codes once, right after the authenticator app is linked.
export async function finishSignIn(req, ticket, code) {
  checkSetup()
  if (await isLocked(req)) return { status: 'locked' }
  if (typeof ticket !== 'string' || typeof code !== 'string') return { status: 'expired' }
  const pending = await getJson(KEYS.pending(ticket))
  if (!pending) return { status: 'expired' }
  const entered = code.replace(/\s+/g, '')

  let recoveryCodes = null
  if (pending.role === 'bookkeeper') {
    const result = await checkBookkeeperCode(pending, entered)
    if (result !== 'ok') return result === 'expired' ? { status: 'expired' } : failed(req)
  } else if (pending.secret) {
    // Linking the app: the code proves it was scanned correctly.
    const step = matchStep(pending.secret, entered)
    if (step === null) return failed(req)
    const saved = await redis(['SET', KEYS.totp, JSON.stringify({ secret: pending.secret, linkedAt: new Date().toISOString() }), 'NX'])
    if (saved === null) return { status: 'expired' } // linked by another sign-in meanwhile
    await redis(['SET', KEYS.lastStep, String(step)])
    recoveryCodes = await newRecoveryCodes()
  } else if (/^\d{6}$/.test(entered)) {
    const { secret } = (await getJson(KEYS.totp)) ?? {}
    const step = secret ? matchStep(secret, entered) : null
    const last = Number((await redis(['GET', KEYS.lastStep])) ?? -1)
    if (step === null || step <= last) return failed(req)
    await redis(['SET', KEYS.lastStep, String(step)])
  } else if (!(await useRecoveryCode(entered))) {
    return failed(req)
  }

  await redis(['DEL', KEYS.pending(ticket)])
  await redis(['DEL', KEYS.fails(clientIp(req))])
  const session = token()
  const record = { role: pending.role, createdAt: Date.now(), bookkeeperId: pending.bookkeeperId ?? pending.setup?.id }
  await redis(['SET', KEYS.session(session), JSON.stringify(record), 'EX', IDLE_SECONDS])
  return { status: 'ok', session, recoveryCodes }
}

// The bookkeeper's code: linking their app the first time (from an invite),
// or the usual 6-digit code. Bookkeepers get no recovery codes; if they lose
// their phone the owner removes them and sends a new invite.
async function checkBookkeeperCode(pending, entered) {
  if (pending.setup) {
    const step = matchStep(pending.secret, entered)
    if (step === null) return 'wrong'
    const invite = await getJson(KEYS.invite)
    if (!invite || invite.id !== pending.setup.id) return 'expired' // the owner cancelled it meanwhile
    const now = new Date().toISOString()
    const { id, name, salt, hash } = pending.setup
    await redis(['SET', KEYS.bookkeeper, JSON.stringify({ id, name, salt, hash, secret: pending.secret, invitedAt: invite.createdAt, linkedAt: now, lastSignIn: now })])
    await redis(['SET', KEYS.bookkeeperLastStep, String(step)])
    await redis(['DEL', KEYS.invite])
    return 'ok'
  }
  const bookkeeper = await getJson(KEYS.bookkeeper)
  if (!bookkeeper || bookkeeper.id !== pending.bookkeeperId) return 'expired'
  const step = /^\d{6}$/.test(entered) ? matchStep(bookkeeper.secret, entered) : null
  const last = Number((await redis(['GET', KEYS.bookkeeperLastStep])) ?? -1)
  if (step === null || step <= last) return 'wrong'
  await redis(['SET', KEYS.bookkeeperLastStep, String(step)])
  await redis(['SET', KEYS.bookkeeper, JSON.stringify({ ...bookkeeper, lastSignIn: new Date().toISOString() })])
  return 'ok'
}

// The bookkeeper's first sign-in: the invite code from the owner and the
// password they choose. Returns a ticket and a new authenticator secret to link.
export async function acceptInvite(req, code, password) {
  checkSetup()
  if (await isLocked(req)) return { status: 'locked' }
  const invite = await getJson(KEYS.invite)
  const normalized = normalizeInvite(code)
  const matches = invite && normalized && timingSafeEqual(sha(normalized), Buffer.from(invite.hash, 'hex'))
  if (!matches || Date.parse(invite.expires) < Date.now()) {
    await countFailure(req)
    return { status: 'wrong' }
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) return { status: 'weak' }
  if (timingSafeEqual(sha(password), sha(process.env.FINANCE_PASSWORD))) return { status: 'weak' }
  const salt = randomBytes(16).toString('hex')
  const setup = { id: invite.id, name: invite.name, salt, hash: passwordHash(password, salt) }
  const ticket = token()
  const pending = { role: 'bookkeeper', secret: newSecret(), setup }
  await redis(['SET', KEYS.pending(ticket), JSON.stringify(pending), 'EX', PENDING_SECONDS])
  return { status: 'ok', ticket, secret: pending.secret, name: invite.name }
}

// What the owner sees on the Access page.
export async function accessStatus() {
  const [bookkeeper, invite] = await Promise.all([getJson(KEYS.bookkeeper), getJson(KEYS.invite)])
  return {
    bookkeeper: bookkeeper && { name: bookkeeper.name, invitedAt: bookkeeper.invitedAt, linkedAt: bookkeeper.linkedAt, lastSignIn: bookkeeper.lastSignIn },
    invite: invite && Date.parse(invite.expires) > Date.now() ? { name: invite.name, createdAt: invite.createdAt, expires: invite.expires } : null,
  }
}

// A new invite replaces any unused one. Returns the code to pass on; only its
// hash is kept.
export async function inviteBookkeeper(name) {
  const code = [0, 1, 2].map(() => recoveryCode().replace('-', '').slice(0, 4)).join('-')
  const now = Date.now()
  const invite = {
    id: randomBytes(9).toString('base64url'),
    name,
    hash: sha(code).toString('hex'),
    createdAt: new Date(now).toISOString(),
    expires: new Date(now + INVITE_DAYS * 86_400_000).toISOString(),
  }
  await redis(['SET', KEYS.invite, JSON.stringify(invite), 'EX', INVITE_DAYS * 86_400])
  return { code, expires: invite.expires }
}

// Removes the bookkeeper and any unused invite. Their open sessions stop
// working on their next request (currentUser checks the bookkeeper still exists).
export async function removeBookkeeper() {
  await redis(['DEL', KEYS.bookkeeper])
  await redis(['DEL', KEYS.invite])
  await redis(['DEL', KEYS.bookkeeperLastStep])
}

const normalizeInvite = (code) => {
  const c = String(code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}` : null
}

async function failed(req) {
  await countFailure(req)
  return { status: 'wrong' }
}

function recoveryCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chars = [...randomBytes(8)].map((b) => alphabet[b % alphabet.length]).join('')
  return `${chars.slice(0, 4)}-${chars.slice(4)}`
}

async function newRecoveryCodes() {
  const codes = Array.from({ length: 8 }, recoveryCode)
  await redis(['SET', KEYS.recovery, JSON.stringify(codes.map((c) => hashKey(c)))])
  return codes
}

const normalizeRecovery = (code) => {
  const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : null
}

// Each recovery code works once.
async function useRecoveryCode(code) {
  const normalized = normalizeRecovery(code)
  if (!normalized) return false
  const hashes = (await getJson(KEYS.recovery)) ?? []
  const h = hashKey(normalized)
  if (!hashes.includes(h)) return false
  await redis(['SET', KEYS.recovery, JSON.stringify(hashes.filter((x) => x !== h))])
  return true
}

export const recoveryCodesLeft = async () => ((await getJson(KEYS.recovery)) ?? []).length

// The signed-in user for this request, or null. Each request pushes the idle
// timeout back.
export async function currentUser(req) {
  const t = readCookie(req)
  if (!t) return null
  const session = await getJson(KEYS.session(t))
  if (!session) return null
  if (Date.now() - session.createdAt > MAX_SESSION_MS) {
    await redis(['DEL', KEYS.session(t)])
    return null
  }
  if (session.role === 'bookkeeper') {
    const bookkeeper = await getJson(KEYS.bookkeeper)
    if (!bookkeeper || bookkeeper.id !== session.bookkeeperId) {
      await redis(['DEL', KEYS.session(t)])
      return null
    }
    await redis(['EXPIRE', KEYS.session(t), IDLE_SECONDS])
    return { role: 'bookkeeper', name: bookkeeper.name }
  }
  await redis(['EXPIRE', KEYS.session(t), IDLE_SECONDS])
  return { role: session.role }
}

export async function signOut(req) {
  const t = readCookie(req)
  if (t) await redis(['DEL', KEYS.session(t)])
}

function readCookie(req) {
  const header = String(req.headers.cookie ?? '')
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE) return rest.join('=') || null
  }
  return null
}

// The session cookie is only sent to /api/finance, can't be read by page
// scripts, and is never sent from other sites.
export function sessionCookie(value) {
  const secure = process.env.LCD_MEMORY_STORE ? '' : '; Secure'
  const age = value ? Math.floor(MAX_SESSION_MS / 1000) : 0
  return `${COOKIE}=${value ?? ''}; Path=/api/finance; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`
}
