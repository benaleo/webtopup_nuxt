import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const prisma = db()
  const items = await prisma.transaction.findMany({ orderBy: { invoice: 'desc' }, take: 100 })
  return { items }
})
