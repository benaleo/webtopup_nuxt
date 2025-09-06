import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  name: z.string().min(1).optional(),
  service_amount: z.number().min(0).optional(),
  service_percentage: z.number().min(0).optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['QRIS', 'E_WALLET', 'VIRTUAL_ACCOUNT', 'STORE']).optional(),
  orders: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)
  const item = await db.paymentMethod.update({ where: { id }, data })
  return { item }
})
