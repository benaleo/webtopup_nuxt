import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const prisma = db()
  const items = await prisma.paymentMethod.findMany({
    where: { is_active: true },
    orderBy: { orders: 'asc' },
  })
  return { items }
})
