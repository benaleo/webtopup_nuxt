import { db } from '~~/server/utils/db'
// Note: Avoid strict typing on where to prevent transient Prisma type mismatches during schema changes
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const page = Math.max(parseInt((q.page as string) || '1', 10), 1)
  const pageSize = Math.min(Math.max(parseInt((q.pageSize as string) || '10', 10), 1), 100)
  const skip = (page - 1) * pageSize
  const gameId = (q.game_id as string) || undefined
  const where = gameId ? { game_id: gameId } : {}

  const [total, items] = await Promise.all([
    db.product.count({ where: where as any }),
    db.product.findMany({
      where: where as any,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const pageCount = Math.ceil(total / pageSize)
  return { items, meta: { page, pageSize, total, pageCount } }
})
