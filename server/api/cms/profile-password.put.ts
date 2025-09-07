import { db } from '~~/server/utils/db'
import { requireAdmin } from './_auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(6),
  confirm_password: z.string().min(6),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export default defineEventHandler(async (event) => {
  const payload: any = await requireAdmin(event)
  const body = await readBody(event)
  const { old_password, new_password } = schema.parse(body)

  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const ok = await bcrypt.compare(old_password, user.password)
  if (!ok) throw createError({ statusCode: 400, message: 'Old password is incorrect' })

  const hashed = await bcrypt.hash(new_password, 10)
  await db.user.update({ where: { id: user.id }, data: { password: hashed } })

  return { success: true }
})
