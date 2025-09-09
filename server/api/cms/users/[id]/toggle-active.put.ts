import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

const paramsSchema = z.object({ id: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const { id } = paramsSchema.parse(event.context.params || {})

  // ensure requester is admin
  const auth = await requireAuth(event)
  if (!auth || !['SUPERADMIN', 'ADMIN'].includes((auth as any).role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // find user
  const user = await db.user.findUnique({ where: { id }, select: { id: true, is_active: true } })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const updated = await db.user.update({ where: { id }, data: { is_active: !user.is_active }, select: { id: true, is_active: true } })

  return { id: updated.id, is_active: updated.is_active }
})
