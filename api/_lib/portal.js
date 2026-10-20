// Client logins for linocondigital.com/clients. Each client has at most one
// login: an email and a password the client chooses. Lino creates a one-time
// invite code in /admin (good for 7 days) and sends it to the client, who
// uses it to set up their login. A new invite replaces the old login once
// it's used, which is also how a forgotten password is reset.
//
// Passwords are kept only as scrypt hashes. Sessions live in Redis behind an
// HttpOnly cookie: 12 hours without activity, 7 days at most. Five wrong tries
// from one connection (or 30 overall) pause sign-in for 15 minutes.
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { redis } from './store.js'

const IDLE_SECONDS = 12 * 60 * 60
const MAX_SESSION_MS = 7 * 24 * 60 * 60 * 1000
const LOCK_SECONDS = 15 * 60
const MAX_TRIES = 5
const MAX_TRIES_ALL = 30
const INVITE_DAYS = 7
export const MIN_PASSWORD = 10
const COOKIE = 'lcd_cli'

const hashKey = (value) => createHash('sha256').update(String(value)).digest('hex')
const token = () => randomBytes(32).toString('base64url')

const KEYS = {
  account: (clientId) => `portal:account:${clientId}`,
  email: (email) => `portal:email:${hashKey(email)}`,
  invite: (clientId) => `portal:invite:${clientId}`,
  code: (code) => `portal:code:${hashKey(code)}`,
  session: (t) => `portal:session:${hashKey(t)}`,
  fails: (ip) => `portal:fails:${ip}`,
  failsAll: 'portal:fails:all',
}

const getJson = async (key) => {
  const raw = await redis(['GET', key])
  return raw ? JSON.parse(raw) : null
}

const passwordHash = (password, salt) => scryptSync(String(password), salt, 32).toString('hex')

export const cleanEmail = (email) => {
  const e = typeof email === 'string' ? email.trim().toLowerCase() : ''
  return e.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null
}

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

async function startSession(req, account) {
  await redis(['DEL', KEYS.fails(clientIp(req))])
  const t = token()
  const session = { clientId: account.clientId, accountId: account.id, createdAt: Date.now() }
  await redis(['SET', KEYS.session(t), JSON.stringify(session), 'EX', IDLE_SECONDS])
  return t
}

// ---------- Lino's side (/admin) ----------

export async function loginStatus(clientId) {
  const [account, invite] = await Promise.all([getJson(KEYS.account(clientId)), getJson(KEYS.invite(clientId))])
  return {
    account: account && { email: account.email, createdAt: account.createdAt, lastSignIn: account.lastSignIn ?? null },
    invite: invite && Date.parse(invite.expires) > Date.now() ? { createdAt: invite.createdAt, expires: invite.expires } : null,
  }
}

// A new code replaces any unused one. Returns the code to pass on; only its
// hash is kept.
export async function inviteClient(clientId) {
  const old = await getJson(KEYS.invite(clientId))
  if (old) await redis(['DEL', `portal:code:${old.hash}`])
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chars = [...randomBytes(12)].map((b) => alphabet[b % alphabet.length]).join('')
  const code = `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`
  const now = Date.now()
  const invite = { hash: hashKey(code), createdAt: new Date(now).toISOString(), expires: new Date(now + INVITE_DAYS * 86_400_000).toISOString() }
  const ttl = INVITE_DAYS * 86_400
  await redis(['SET', KEYS.invite(clientId), JSON.stringify(invite), 'EX', ttl])
  await redis(['SET', KEYS.code(code), clientId, 'EX', ttl])
  return { code, expires: invite.expires }
}

// Removes the client's login and any unused invite. Their open sessions stop
// working on their next request.
export async function removeLogin(clientId) {
  const [account, invite] = await Promise.all([getJson(KEYS.account(clientId)), getJson(KEYS.invite(clientId))])
  if (account) {
    await redis(['DEL', KEYS.email(account.email)])
    await redis(['DEL', KEYS.account(clientId)])
  }
  if (invite) {
    await redis(['DEL', `portal:code:${invite.hash}`])
    await redis(['DEL', KEYS.invite(clientId)])
  }
}

// ---------- the client's side (/clients) ----------

const normalizeCode = (code) => {
  const c = String(code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}` : null
}

// First sign-in: the invite code from Lino, the client's email and the
// password they choose. Signs them in.
export async function acceptInvite(req, code, email, password) {
  if (await isLocked(req)) return { status: 'locked' }
  const normalized = normalizeCode(code)
  const clientId = normalized ? await redis(['GET', KEYS.code(normalized)]) : null
  const invite = clientId ? await getJson(KEYS.invite(clientId)) : null
  if (!invite || invite.hash !== hashKey(normalized) || Date.parse(invite.expires) < Date.now()) {
    await countFailure(req)
    return { status: 'invite' }
  }
  const cleaned = cleanEmail(email)
  if (!cleaned) return { status: 'email' }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD || password.length > 200) return { status: 'weak' }
  const owner = await redis(['GET', KEYS.email(cleaned)])
  if (owner && owner !== clientId) return { status: 'taken' }

  const old = await getJson(KEYS.account(clientId))
  if (old && old.email !== cleaned) await redis(['DEL', KEYS.email(old.email)])
  const salt = randomBytes(16).toString('hex')
  const now = new Date().toISOString()
  const account = { id: randomBytes(9).toString('base64url'), clientId, email: cleaned, salt, hash: passwordHash(password, salt), createdAt: now, lastSignIn: now }
  await redis(['SET', KEYS.account(clientId), JSON.stringify(account)])
  await redis(['SET', KEYS.email(cleaned), clientId])
  await redis(['DEL', KEYS.code(normalized)])
  await redis(['DEL', KEYS.invite(clientId)])
  return { status: 'ok', session: await startSession(req, account) }
}

// A made-up hash to compare against when the email isn't known, so a wrong
// email takes as long as a wrong password.
const DUMMY = { salt: '00', hash: passwordHash('not a password', '00') }

export async function signIn(req, email, password) {
  if (await isLocked(req)) return { status: 'locked' }
  const cleaned = cleanEmail(email)
  const clientId = cleaned ? await redis(['GET', KEYS.email(cleaned)]) : null
  const account = clientId ? await getJson(KEYS.account(clientId)) : null
  const { salt, hash } = account ?? DUMMY
  const given = typeof password === 'string' ? password.slice(0, 200) : ''
  const same = timingSafeEqual(Buffer.from(passwordHash(given, salt), 'hex'), Buffer.from(hash, 'hex'))
  if (!account || !given || !same) {
    await countFailure(req)
    return { status: 'wrong' }
  }
  await redis(['SET', KEYS.account(clientId), JSON.stringify({ ...account, lastSignIn: new Date().toISOString() })])
  return { status: 'ok', session: await startSession(req, account) }
}

// The signed-in client's id for this request, or null. Each request pushes
// the idle timeout back.
export async function currentClient(req) {
  const t = readCookie(req)
  if (!t) return null
  const session = await getJson(KEYS.session(t))
  if (!session) return null
  const account = await getJson(KEYS.account(session.clientId))
  if (!account || account.id !== session.accountId || Date.now() - session.createdAt > MAX_SESSION_MS) {
    await redis(['DEL', KEYS.session(t)])
    return null
  }
  await redis(['EXPIRE', KEYS.session(t), IDLE_SECONDS])
  return session.clientId
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

// Only sent to /api/portal, can't be read by page scripts, never sent from
// other sites.
export function sessionCookie(value) {
  const secure = process.env.LCD_MEMORY_STORE ? '' : '; Secure'
  const age = value ? Math.floor(MAX_SESSION_MS / 1000) : 0
  return `${COOKIE}=${value ?? ''}; Path=/api/portal; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`
}
