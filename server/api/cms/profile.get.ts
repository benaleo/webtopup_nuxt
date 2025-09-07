import { db } from '~~/server/utils/db'
import { requireAdmin } from './_auth'

export default defineEventHandler(async (event) => {
  const payload: any = await requireAdmin(event)
  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  const { password, ...safe } = user as any
  return { user: safe }
})
