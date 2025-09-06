import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const prisma = db()
  const items = await prisma.gallery.findMany({
    where: { is_active: true, deleted_at: null },
    orderBy: { orders: 'asc' },
  })
  return { items }
})
