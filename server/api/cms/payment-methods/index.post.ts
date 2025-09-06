import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  name: z.string().min(1),
  service_amount: z.number().min(0),
  service_percentage: z.number().min(0).optional().default(0),
  image: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['QRIS', 'E_WALLET', 'VIRTUAL_ACCOUNT', 'STORE']),
  orders: z.number().int().min(0),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)
  const prisma = db()
  const item = await prisma.paymentMethod.create({
    data: { ...data, is_active: data.is_active ?? true },
  })
  return { item }
})
