import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') as string
  const game = await db.game.findUnique({ where: { slug } })
  if (!game || !game.is_active || game.deleted_at) {
    throw createError({ statusCode: 404, message: 'Game not found' })
  }
  return { item: game }
})
