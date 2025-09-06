import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  orders: z.number().int().min(0).optional(),
  name: z.string().min(1).optional(),
  file_url: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)
  const item = await db.gallery.update({
    where: { id },
    data: { ...data, updated_by: user.username },
  })
  return { item }
})
