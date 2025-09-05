import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const prisma = db()
  const item = await prisma.gallery.update({
    where: { id },
    data: { is_active: false, deleted_at: new Date(), updated_by: user.username },
  })
  return { item }
})
