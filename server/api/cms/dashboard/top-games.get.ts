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

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  async function topRange(range: { gte: Date; lte: Date }) {
    const grouped = await db.transaction.groupBy({
      by: ['game_id'],
      where: {
        is_success: true,
        game_id: { not: null },
        created_at: { gte: range.gte, lte: range.lte },
      } as any,
      _sum: { total_payment: true },
      _count: { _all: true },
      orderBy: { _sum: { total_payment: 'desc' } },
      take: 5,
    })
    const gameIds = grouped.map(g => g.game_id!).filter(Boolean)
    const games = await db.game.findMany({ where: { id: { in: gameIds } } })
    const gameMap = new Map(games.map(g => [g.id, g]))
    return grouped.map(g => ({
      game_id: g.game_id,
      game_name: gameMap.get(g.game_id!)?.name || 'Unknown',
      total_payment: g._sum.total_payment || 0,
      count: g._count._all,
    }))
  }

  const today = await topRange({ gte: startOfToday(), lte: endOfToday() })
  const month = await topRange({ gte: startOfMonth(), lte: endOfMonth() })
  const year = await topRange({ gte: startOfYear(), lte: endOfYear() })

  return { today, month, year }
})
