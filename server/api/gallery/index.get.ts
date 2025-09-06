import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const prisma = db()
    const items = await prisma.gallery.findMany({
      where: { is_active: true, deleted_at: null },
      orderBy: { orders: 'asc' },
    })
    return { items }
  } catch (err: any) {
    // Surface the error message in production logs
    console.error('[api/gallery] error:', err?.message || err)
    throw createError({ statusCode: 500, statusMessage: 'Server Error', message: err?.message || 'Server Error' })
  }
})
