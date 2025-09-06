import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  slug: z.string().optional(),
  name: z.string().optional(),
  publisher: z.string().optional(),
  image: z.union([
    z.string().url(),
    z.string().startsWith('/uploads/'),
    z.literal('')
  ]).optional().nullable(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const data = schema.parse(body)

  const prisma = db()
  
  // Only include fields that are actually provided in the request
  const updateData: any = { ...data }
  
  // Don't update image if it's not provided
  if (updateData.image === '') {
    delete updateData.image
  }
  
  // Always update the updated_by field
  updateData.updated_by = user.username

  const item = await prisma.game.update({
    where: { id },
    data: updateData,
  })
  return { item }
})
