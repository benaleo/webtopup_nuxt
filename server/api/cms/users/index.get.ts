import { z } from 'zod'
import { db } from '~~/server/utils/db'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const { page, pageSize, search } = querySchema.parse(q)

  const where = search
    ? {
        OR: [
          { username: { contains: search!, mode: 'insensitive' } },
          { name: { contains: search!, mode: 'insensitive' } },
        ],
      }
    : {}

  const [total, items] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    }),
  ])

  return {
    page,
    pageSize,
    total,
    items,
  }
})
