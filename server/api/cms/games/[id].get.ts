import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = db()
  const id = getRouterParam(event, 'id') as string
  const item = await prisma.game.findUnique({ where: { id } })
  if (!item) throw createError({ statusCode: 404, message: 'Game not found' })
  return { item }
})
