import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { Prisma } from '@prisma/client'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const { page, pageSize, search } = querySchema.parse(q)

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { username: { contains: search!, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: search!, mode: Prisma.QueryMode.insensitive } },
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
        is_popular_joki: true,
        is_open_joki: true,
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
