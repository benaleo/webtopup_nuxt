import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const prisma = db()
  const items = await prisma.voucher.findMany({ where: { is_active: true, deleted_at: null }, orderBy: { created_at: 'desc' } })
  return { items }
})
