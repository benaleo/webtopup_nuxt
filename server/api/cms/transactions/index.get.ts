import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await db.transaction.findMany({ orderBy: { invoice: 'desc' }, take: 100 })
  return { items }
})
