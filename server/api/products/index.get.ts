import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { q, game, gameSlug } = getQuery(event) as { q?: string; game?: string; gameSlug?: string }
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
  if (typeof gameSlug === 'string' && gameSlug.trim().length) {
    const g = await prisma.game.findUnique({ where: { slug: gameSlug } })
    if (g) where.game_id = g.id
  }
  if (ors.length) where.OR = ors

  // If filtering by specific game via gameSlug (thus where.game_id is set), order by value ASC as requested
  const orderBy: any = (where as any).game_id ? { value: 'desc' } : { created_at: 'desc' }
  const items = await prisma.product.findMany({ where, orderBy })
  return { items }
})
