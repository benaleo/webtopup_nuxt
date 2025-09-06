import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '~~/server/utils/db'
import { setSession } from '~~/server/utils/auth'

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = schema.parse(body)

  const user = await db.user.findUnique({ where: { username } })
  if (!user || !user.is_active) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw createError({ statusCode: 401, message: 'Invalid credentials' })

  if (!(user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
    throw createError({ statusCode: 403, message: 'Insufficient role' })
  }

  const payload = { id: user.id, username: user.username, name: user.name, role: user.role }
  await setSession(event, payload)

  return { user: payload }
})
