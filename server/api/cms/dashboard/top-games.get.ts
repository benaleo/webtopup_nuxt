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
function startOfYear() {
  const d = new Date()
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0)
}
function endOfYear() {
  const d = new Date()
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
}

// Very simple in-memory cache with 60s TTL
const cache: Record<string, { data: any; ts: number }> = {}
const TTL = 60 * 1000

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  async function topRange(key: string, range: { gte: Date; lte: Date }) {
    const now = Date.now()
    const ck = `${key}:${range.gte.toISOString()}:${range.lte.toISOString()}`
    const cached = cache[ck]
    if (cached && now - cached.ts < TTL) return cached.data

    // Use raw SQL for faster aggregation with indexes
    const rows: Array<{ game_id: string; total_payment: number; tx_count: number }> = await (db as any).$queryRaw`
      SELECT "game_id", SUM("total_payment")::float AS total_payment, COUNT(*)::int AS tx_count
      FROM "Transaction"
      WHERE "is_success" = true
        AND "game_id" IS NOT NULL
        AND "created_at" BETWEEN ${range.gte} AND ${range.lte}
      GROUP BY "game_id"
      ORDER BY SUM("total_payment") DESC
      LIMIT 5
    `
    const gameIds = rows.map(r => r.game_id)
    const games = await db.game.findMany({ where: { id: { in: gameIds } } })
    const gameMap = new Map(games.map(g => [g.id, g]))
    const data = rows.map(r => ({
      game_id: r.game_id,
      game_name: gameMap.get(r.game_id)?.name || 'Unknown',
      total_payment: r.total_payment || 0,
      count: r.tx_count || 0,
    }))
    cache[ck] = { data, ts: now }
    return data
  }

  const today = await topRange('today', { gte: startOfToday(), lte: endOfToday() })
  const month = await topRange('month', { gte: startOfMonth(), lte: endOfMonth() })
  const year = await topRange('year', { gte: startOfYear(), lte: endOfYear() })

  return { today, month, year }
})
