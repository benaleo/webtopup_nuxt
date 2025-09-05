import { z } from 'zod'
import { db } from '~~/server/utils/db'

const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(6),
  product_id: z.string().uuid(),
  qty: z.number().int().min(1),
  voucher: z.string().optional(),
})

function genInvoice() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `INV-${ymd}-${rand}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, phone, product_id, qty, voucher } = schema.parse(body)

  const prisma = db()
  const product = await prisma.product.findUnique({ where: { id: product_id } })
  if (!product || !product.is_active) {
    throw createError({ statusCode: 400, message: 'Invalid product' })
  }

  const invoice = genInvoice()
  const total = product.price * qty
  const trx = await prisma.transaction.create({
    data: {
      invoice,
      email,
      phone,
      voucher: voucher || null,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      qty,
      total_payment: total,
    },
  })

  return { item: trx }
})
