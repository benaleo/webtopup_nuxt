import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const items = await db.paymentMethod.findMany({
    where: { is_active: true },
    orderBy: { orders: 'asc' },
  })
  return { items }
})
