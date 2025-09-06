import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { invoice } = getQuery(event)

  if (typeof invoice === 'string' && invoice.trim().length) {
    const trx = await db.transaction.findUnique({ where: { invoice } })
    if (!trx) throw createError({ statusCode: 404, message: 'Invoice not found' })
    return { item: trx }
  }

  // Fallback: list latest
  const items = await db.transaction.findMany({ orderBy: { id: 'desc' }, take: 50 })
  return { items }
})
