import { db } from '~~/server/utils/db'
import { requireAdmin } from '../../cms/_auth'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}
function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}
function endOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

// Very simple in-memory cache with 60s TTL
const cache: Record<string, { data: any; ts: number }> = {}
const TTL = 60 * 1000

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  async function topLinks(key: string, range: { gte: Date; lte: Date }) {
    const now = Date.now()
    const ck = `${key}:${range.gte.toISOString()}:${range.lte.toISOString()}`
    const cached = cache[ck]
    if (cached && now - cached.ts < TTL) return cached.data

    const rows: Array<{ url: string; cnt: number }> = await (db as any).$queryRaw`
      SELECT "url", COUNT(*)::int AS cnt
      FROM "LogTrafic"
      WHERE "createdAt" BETWEEN ${range.gte} AND ${range.lte}
      GROUP BY "url"
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `
    const data = rows.map(r => ({ url: r.url, count: r.cnt }))
    cache[ck] = { data, ts: now }
    return data
  }

  const daily = await topLinks('daily', { gte: startOfToday(), lte: endOfToday() })
  const monthly = await topLinks('monthly', { gte: startOfMonth(), lte: endOfMonth() })

  return { daily, monthly }
})
