import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { requireAdmin } from '../_auth'

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  publisher: z.string().min(1),
  image: z.string().min(1).refine(
    (val) => val.startsWith('http') || val.startsWith('/uploads/'),
    { message: 'Image must be a valid URL or start with /uploads/' }
  ),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const data = schema.parse(body)

  const item = await db.game.create({
    data: {
      slug: data.slug as string,
      name: data.name as string,
      publisher: data.publisher as string,
      image: data.image as string,
      description: data.description || null,
      is_active: data.is_active ?? true,
      metadata: data.metadata ?? undefined,
      created_by: user.username,
    },
  })
  return { item }
})
