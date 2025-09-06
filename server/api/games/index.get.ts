import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)

  const where: any = { is_active: true, deleted_at: null }
  if (typeof q === 'string' && q.trim().length) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { publisher: { contains: q, mode: 'insensitive' } },
    ]
  }

  const games = await db.game.findMany({
    where,
    orderBy: { created_at: 'desc' },
  })
  return { items: games }
})
