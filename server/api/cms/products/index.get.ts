import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = db()
  const items = await prisma.product.findMany({ orderBy: { created_at: 'desc' } })
  return { items }
})
