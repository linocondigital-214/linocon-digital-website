// Saves client progress in Upstash Redis, which Vercel connects to this
// project from its Storage tab (it adds the URL and token below as
// environment variables). Talks to Redis over its REST API, so no extra
// package is needed. Local `npm run dev` uses an in-memory copy instead.
import { randomBytes } from 'node:crypto'

const memory = new Map()
const expiresAt = new Map()

export class SetupError extends Error {}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

export async function redis(command) {
  const config = redisConfig()
  if (!config) {
    if (process.env.LCD_MEMORY_STORE) return memoryCommand(command)
    throw new SetupError('Storage is not connected')
  }
  const res = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.result
}

function memoryCommand([name, key, ...args]) {
  if (expiresAt.has(key) && expiresAt.get(key) <= Date.now()) {
    memory.delete(key)
    expiresAt.delete(key)
  }
  switch (name) {
    case 'GET':
      return memory.get(key) ?? null
    case 'SET': {
      // Supports the SET key value [NX] [EX seconds] forms the finance app uses.
      const opts = args.slice(1).map(String)
      if (opts.includes('NX') && memory.has(key)) return null
      memory.set(key, args[0])
      const ex = opts.indexOf('EX')
      if (ex >= 0) expiresAt.set(key, Date.now() + Number(opts[ex + 1]) * 1000)
      else expiresAt.delete(key)
      return 'OK'
    }
    case 'DEL':
      expiresAt.delete(key)
      return memory.delete(key) ? 1 : 0
    case 'INCR': {
      const next = Number(memory.get(key) ?? 0) + 1
      memory.set(key, String(next))
      return next
    }
    case 'EXPIRE':
      if (!memory.has(key)) return 0
      expiresAt.set(key, Date.now() + Number(args[0]) * 1000)
      return 1
    case 'SADD': {
      const set = memory.get(key) ?? new Set()
      set.add(args[0])
      memory.set(key, set)
      return 1
    }
    case 'SREM':
      return memory.get(key)?.delete(args[0]) ? 1 : 0
    case 'SMEMBERS':
      return [...(memory.get(key) ?? [])]
    default:
      throw new Error(`Unsupported command ${name}`)
  }
}

const INDEX_KEY = 'lcd:clients'
const clientKey = (id) => `lcd:client:${id}`

// Client ids double as the private link, so they're long and random.
export const newClientId = () => randomBytes(12).toString('base64url')

export const isClientId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{16}$/.test(id)

export async function getClient(id) {
  const raw = await redis(['GET', clientKey(id)])
  return raw ? JSON.parse(raw) : null
}

export async function saveClient(client) {
  await redis(['SET', clientKey(client.id), JSON.stringify(client)])
  await redis(['SADD', INDEX_KEY, client.id])
}

export async function deleteClient(id) {
  await redis(['DEL', clientKey(id)])
  await redis(['SREM', INDEX_KEY, id])
}

export async function listClients() {
  const ids = await redis(['SMEMBERS', INDEX_KEY])
  const clients = await Promise.all(ids.map(getClient))
  return clients.filter(Boolean)
}
