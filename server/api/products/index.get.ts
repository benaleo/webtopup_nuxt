import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { q, game } = getQuery(event)
  const prisma = db()

  const where: any = { is_active: true, deleted_at: null }
  const ors: any[] = []
  if (typeof q === 'string' && q.trim().length) {
    ors.push({ name: { contains: q, mode: 'insensitive' } })
    ors.push({ value: { contains: q, mode: 'insensitive' } })
  }
  if (typeof game === 'string' && game.trim().length) {
    // Best-effort mapping: filter by product name/value containing game string
    ors.push({ name: { contains: game, mode: 'insensitive' } })
    ors.push({ value: { contains: game, mode: 'insensitive' } })
  }
  if (ors.length) where.OR = ors

  const items = await prisma.product.findMany({ where, orderBy: { created_at: 'desc' } })
  return { items }
})
