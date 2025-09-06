import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  type: z.enum(['AMOUNT', 'PERCENTAGE']),
  valid_at: z.string().or(z.date()),
  valid_until: z.string().or(z.date()),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)
  const prisma = db()
  const item = await prisma.voucher.create({
    data: { ...data, valid_at: new Date(data.valid_at), valid_until: new Date(data.valid_until), is_active: data.is_active ?? true },
  })
  return { item }
})
