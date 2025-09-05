import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  is_approved: z.boolean().optional(),
  is_success: z.boolean().optional(),
  reason: z.string().nullable().optional(),
  payment_id: z.string().nullable().optional(),
  payment_name: z.string().nullable().optional(),
  service_amount: z.number().nullable().optional(),
  pdf_url: z.string().url().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)

  const prisma = db()
  const item = await prisma.transaction.update({
    where: { id },
    data,
  })
  return { item }
})
