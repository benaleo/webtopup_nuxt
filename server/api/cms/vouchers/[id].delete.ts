import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  // Fetch current voucher to retrieve existing code
  const current = await db.voucher.findUnique({ where: { id } })
  if (!current) {
    throw createError({ statusCode: 404, message: 'Voucher not found' })
  }

  // Build timestamp suffix YYYYMMDD_HHMMSS
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const currCode = (current as any).code as string | undefined
  const newCode = currCode ? `${currCode}_${ts}` : undefined

  // Cast payload to any to avoid type mismatch until Prisma client reflects schema changes
  const payload: any = {
    is_active: false,
    deleted_at: now,
    updated_by: (user as any).username,
  }
  if (newCode) payload.code = newCode

  const item = await db.voucher.update({
    where: { id },
    data: payload,
  })
  return { item }
})
