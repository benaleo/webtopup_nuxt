import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '~~/server/utils/db'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, username, password } = schema.parse(body)

  // Ensure username is unique
  const existing = await db.user.findUnique({ where: { username } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Username already taken' })
  }

  const hashed = await bcrypt.hash(password, 10)

  const created = await db.user.create({
    data: {
      name,
      username,
      password: hashed,
      role: 'USER',
      is_active: true,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    }
  })

  return { user: created }
})
