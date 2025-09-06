import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  game_id: z.string().uuid(),
  name: z.string().min(1),
  value: z.string().min(1),
  price: z.number().min(0),
  is_instant: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)

  const prisma = db()
  const item = await prisma.product.create({
    data: {
      ...data,
      is_instant: data.is_instant ?? false,
      is_active: data.is_active ?? true,
      created_by: user.username,
    },
  })
  return { item }
})
