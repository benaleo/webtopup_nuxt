import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  name: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  is_instant: z.boolean().optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)

  // Note: temporarily cast to any to avoid TS mismatch until Prisma client is regenerated
  const payload: any = {
    ...data,
    metadata: data.metadata ?? undefined,
    updated_by: user.username,
  }

  const item = await db.product.update({
    where: { id },
    data: payload,
  })
  return { item }
})
