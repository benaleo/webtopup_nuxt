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
  metadata: z.record(z.any()).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)

  // Note: temporarily cast to any to avoid TS mismatch until Prisma client is regenerated
  const payload: any = {
    ...data,
    is_instant: data.is_instant ?? false,
    is_active: data.is_active ?? true,
    metadata: data.metadata ?? undefined,
    created_by: user.username,
  }

  const item = await db.product.create({ data: payload })
  return { item }
})
