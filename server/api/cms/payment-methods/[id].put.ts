import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  name: z.string().min(1).optional(),
  service_amount: z.number().min(0).optional(),
  image: z.string().optional(),
  orders: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)
  const prisma = db()
  const item = await prisma.paymentMethod.update({ where: { id }, data })
  return { item }
})
