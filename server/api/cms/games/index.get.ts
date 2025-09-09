import { db } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const q = getQuery(event)
  const page = Math.max(parseInt((q.page as string) || '1', 10), 1)
  const pageSize = Math.min(Math.max(parseInt((q.pageSize as string) || '10', 10), 1), 100)
  const skip = (page - 1) * pageSize

  const [total, items] = await Promise.all([
    db.game.count(),
    db.game.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const pageCount = Math.ceil(total / pageSize)
  return { items, meta: { page, pageSize, total, pageCount } }
})
