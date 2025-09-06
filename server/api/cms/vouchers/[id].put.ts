import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  minimum: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  type: z.enum(['AMOUNT', 'PERCENTAGE']).optional(),
  valid_at: z.string().or(z.date()).optional(),
  valid_until: z.string().or(z.date()).optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)
  const item = await db.voucher.update({
    where: { id },
    data: { ...data, valid_at: data.valid_at ? new Date(data.valid_at) : undefined, valid_until: data.valid_until ? new Date(data.valid_until) : undefined, updated_by: (await requireAdmin(event)).username },
  })
  return { item }
})
