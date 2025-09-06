import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { invoice } = getQuery(event)
  const prisma = db()

  if (typeof invoice === 'string' && invoice.trim().length) {
    const trx = await prisma.transaction.findUnique({ where: { invoice } })
    if (!trx) throw createError({ statusCode: 404, message: 'Invoice not found' })
    return { item: trx }
  }

  // Fallback: list latest
  const items = await prisma.transaction.findMany({ orderBy: { id: 'desc' }, take: 50 })
  return { items }
})
