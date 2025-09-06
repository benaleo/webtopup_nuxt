import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const item = await db.voucher.update({ where: { id }, data: { is_active: false, deleted_at: new Date() } })
  return { item }
})
