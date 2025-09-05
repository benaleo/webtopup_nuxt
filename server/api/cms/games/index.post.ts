import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  publisher: z.string().min(1),
  image: z.string().min(1),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)

  const prisma = db()
  const item = await prisma.game.create({
    data: {
      ...(data as any),
      description: data.description || null,
      is_active: data.is_active ?? true,
      created_by: user.username,
    } as any,
  })
  return { item }
})
