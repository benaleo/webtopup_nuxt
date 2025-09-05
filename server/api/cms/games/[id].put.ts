import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  slug: z.string().optional(),
  name: z.string().optional(),
  publisher: z.string().optional(),
  image: z.string().url().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)

  const prisma = db()
  const item = await prisma.game.update({
    where: { id },
    data: {
      ...data,
      updated_by: user.username,
    },
  })
  return { item }
})
