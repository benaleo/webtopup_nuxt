import { z } from 'zod'
import { db } from '~~/server/utils/db'

const schema = z.object({ code: z.string().min(1), productId: z.string().min(1), qty: z.number().int().min(1) })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code, productId, qty } = schema.parse(body)
  const prisma = db()
  const now = new Date()

  const voucher = await prisma.voucher.findFirst({
    where: { name: code, is_active: true, deleted_at: null, valid_at: { lte: now }, valid_until: { gte: now } },
  })
  if (!voucher) return { applied: false, amount: 0 }

  // Optional: additional validation based on product or qty can be added here
  let discount = 0
  if (voucher.type === 'AMOUNT') discount = voucher.amount
  else if (voucher.type === 'PERCENTAGE') {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (product) discount = (product.price * qty) * (voucher.amount / 100)
  }
  return { applied: true, amount: discount, voucher: { code: voucher.name, type: voucher.type, value: voucher.amount } }
})
