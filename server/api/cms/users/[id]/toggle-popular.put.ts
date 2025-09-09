import { db } from '~~/server/utils/db'
import { requireAdmin } from '../../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'User id is required' })
  }

  const user = await db.user.findUnique({ where: { id } })
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  if (!user.is_open_joki) {
    throw createError({ statusCode: 400, message: 'User is not open to Joki' })
  }

  const updated = await db.user.update({
    where: { id },
    data: { is_popular_joki: !user.is_popular_joki },
    select: { id: true, is_popular_joki: true },
  })

  return updated
})
