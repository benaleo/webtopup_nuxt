import { datetimeRegex, z } from 'zod'
import { db } from '~~/server/utils/db'

const schema = z.object({ code: z.string().min(1), totalBefore: z.number().nonnegative() })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code, totalBefore } = schema.parse(body)
  // +7 hours
  const now = new Date()
  now.setHours(now.getHours() + 7)

  const voucher = await db.voucher.findFirst({
    where: {
      code,
      is_active: true,
      deleted_at: null as any,
      valid_at: { lte: now },
      valid_until: { gte: now },
      stock: { gt: 0 },
    },
  })
  if (!voucher) return { applied: false, amount: 0, type: null, message: 'Voucher tidak valid atau stok habis.' }

  if (typeof voucher.minimum === 'number' && totalBefore < voucher.minimum) {
    return { applied: false, amount: 0, type: voucher.type, message: 'Belum memenuhi minimum transaksi. silahkan tambah sampai minimun transaksi ' + voucher.minimum }
  }

  let discount = 0
  if (voucher.type === 'AMOUNT') discount = voucher.amount
  else if (voucher.type === 'PERCENTAGE') discount = (totalBefore * voucher.amount) / 100

  discount = Math.min(discount, totalBefore)
  return { applied: true, amount: discount, type: voucher.type, message: 'Voucher berhasil diterapkan.' }
})

