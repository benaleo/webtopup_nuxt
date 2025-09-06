import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'
import { eventBus } from '~~/server/utils/events'

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

  const item = await db.transaction.update({
    where: { id },
    data: {
      is_approved: data.is_approved,
      is_success: data.is_success,
      reason: data.reason,
      payment_id: data.payment_id ?? undefined,
      payment_name: data.payment_name ?? undefined,
      service_amount: data.service_amount ?? undefined,
      pdf_url: data.pdf_url ?? undefined,
    },
  })
  // Broadcast update event for live invoice updates
  try {
    eventBus.emit('transaction_update', {
      id: item.id,
      invoice: item.invoice,
      is_approved: item.is_approved,
      is_success: item.is_success,
      reason: item.reason,
      updated_at: new Date().toISOString(),
    })
  } catch {}
  return { item }
})
