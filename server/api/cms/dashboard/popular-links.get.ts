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

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  async function topLinks(range: { gte: Date; lte: Date }) {
    const rows = await db.logTrafic.groupBy({
      by: ['url'],
      where: {
        createdAt: { gte: range.gte, lte: range.lte },
      } as any,
      _count: { _all: true },
      // Order by count of the grouped field (url)
      orderBy: { _count: { url: 'desc' } },
      take: 5,
    })
    // Return url and count
    return rows.map(r => ({ url: r.url, count: r._count._all }))
  }

  const daily = await topLinks({ gte: startOfToday(), lte: endOfToday() })
  const monthly = await topLinks({ gte: startOfMonth(), lte: endOfMonth() })

  return { daily, monthly }
})
