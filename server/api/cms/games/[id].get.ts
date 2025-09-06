import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const item = await db.game.findUnique({ where: { id } })
  if (!item) throw createError({ statusCode: 404, message: 'Game not found' })
  return { item }
})
