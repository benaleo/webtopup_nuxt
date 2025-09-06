import { z } from 'zod'
import { db } from '~~/server/utils/db'

const schema = z.object({
  // User info
  email: z.string().email(),
  phone: z.string().min(6),

  // Product
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_price: z.number().nonnegative(),
  qty: z.number().int().min(1),

  // Payment
  payment_id: z.string().uuid(),
  payment_name: z.string().optional(),
  service_amount: z.number().nonnegative().default(0),
  service_percentage_amount: z.number().nonnegative().default(0),
  total_payment: z.number().nonnegative(),

  // Voucher (optional)
  voucher_code: z.string().optional(),
  voucher_value: z.number().nonnegative().optional(),

  // Extra (optional, currently unused on server but allowed)
  user_id: z.string().optional(),
  server_id: z.string().optional(),
})

function genInvoice() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `INV-${ymd}-${rand}`
}

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const data = schema.parse(raw)


  // Validate product and payment exist and are active
  const [product, payment] = await Promise.all([
    db.product.findUnique({ where: { id: data.product_id } }),
    db.paymentMethod.findUnique({ where: { id: data.payment_id } }),
  ])

  if (!product || !product.is_active) {
    throw createError({ statusCode: 400, message: 'Invalid product' })
  }
  if (!payment || !payment.is_active) {
    throw createError({ statusCode: 400, message: 'Invalid payment method' })
  }

  // Recompute totals on the server for safety
  const baseAmount = product.price * data.qty
  const serviceAmount = payment.service_amount || 0
  const servicePctAmount = baseAmount * ((payment.service_percentage || 0) / 100)
  const totalBefore = baseAmount + serviceAmount + servicePctAmount

  // Handle voucher: verify and compute discount; if valid, decrement stock atomically
  const invoice = genInvoice()
  const result = await db.$transaction(async (tx) => {
    let appliedVoucherValue = 0
    let voucherId: string | undefined = undefined
    let voucherType: 'AMOUNT' | 'PERCENTAGE' | null = null

    if (data.voucher_code) {
      const now = new Date()
      const voucher = await tx.voucher.findFirst({
        where: {
          code: data.voucher_code,
          is_active: true,
          deleted_at: null as any,
          valid_at: { lte: now },
          valid_until: { gte: now },
          stock: { gt: 0 },
        },
      })
      if (!voucher) {
        throw createError({ statusCode: 400, message: 'Voucher tidak valid atau stok habis' })
      }
      if (typeof voucher.minimum === 'number' && totalBefore < voucher.minimum) {
        throw createError({ statusCode: 400, message: 'Belum memenuhi minimum transaksi untuk voucher' })
      }
      // Compute discount
      const rawDiscount = voucher.type === 'AMOUNT' ? voucher.amount : (totalBefore * voucher.amount) / 100
      appliedVoucherValue = Math.ceil(Math.min(rawDiscount, totalBefore))
      voucherId = voucher.id
      voucherType = voucher.type

      // Decrement stock
      await tx.voucher.update({ where: { id: voucher.id }, data: { stock: { decrement: 1 } } })
    }

    const trx = await tx.transaction.create({
      data: {
        invoice,
        email: data.email,
        phone: data.phone,

        // Product
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        qty: data.qty,

        // Payment
        payment_id: payment.id,
        payment_name: payment.name,
        service_amount: voucherType === 'AMOUNT' ? data.voucher_value : 0,
        service_percentage_amount: voucherType === 'PERCENTAGE' ? data.voucher_value : 0,
        total_payment: data.total_payment,

        // Voucher info
        voucher_id: voucherId,
        voucher_value: appliedVoucherValue || 0,
      },
    })

    return trx
  })

  return { success: true, item: result }
})
