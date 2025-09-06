import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  // Read query params for pagination
  const query = getQuery(event)
  let page = Number(query.page ?? 1)
  let limit = Number(query.limit ?? 10)

  // Basic validation and clamping
  if (!Number.isFinite(page) || page < 1) page = 1
  if (!Number.isFinite(limit) || limit < 1) limit = 10
  if (limit > 100) limit = 100

  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    db.transaction.findMany({
      orderBy: { invoice: 'desc' },
      skip,
      take: limit,
      include: {
        payment: { select: { id: true, name: true } },
      },
      where: (() => {
        const q = (query.q as string | undefined)?.trim()
        if (!q) return undefined
        return {
          OR: [
            { invoice: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        }
      })(),
    }),
    db.transaction.count({
      where: (() => {
        const q = (query.q as string | undefined)?.trim()
        if (!q) return undefined
        return {
          OR: [
            { invoice: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        }
      })(),
    }),
  ])

  const pageCount = Math.max(1, Math.ceil(total / limit))
  return { items, total, page, limit, pageCount }
})
