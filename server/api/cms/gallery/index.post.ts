import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  orders: z.number().int().min(0),
  name: z.string().min(1),
  file_url: z.string().url(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)
  const prisma = db()
  const item = await prisma.gallery.create({
    data: {
      ...data,
      is_active: data.is_active ?? true,
      created_by: user.username,
    },
  })
  return { item }
})
