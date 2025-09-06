import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const prisma = db()
  const item = await prisma.paymentMethod.update({ where: { id }, data: { is_active: false } })
  return { item }
})
