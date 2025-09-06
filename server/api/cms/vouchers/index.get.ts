import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const page = Math.max(parseInt((q.page as string) || '1', 10), 1)
  const pageSize = Math.min(Math.max(parseInt((q.pageSize as string) || '10', 10), 1), 100)
  const skip = (page - 1) * pageSize
  const where = { is_active: true, deleted_at: null as any }

  const [total, items] = await Promise.all([
    db.voucher.count({ where }),
    db.voucher.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: pageSize }),
  ])
  const pageCount = Math.ceil(total / pageSize)
  return { items, meta: { page, pageSize, total, pageCount } }
})
