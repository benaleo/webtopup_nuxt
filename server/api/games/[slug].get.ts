import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') as string
  const prisma = db()
  const game = await prisma.game.findUnique({ where: { slug } })
  if (!game || !game.is_active || game.deleted_at) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }
  return { item: game }
})
