import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (path.startsWith('/cms') && path !== '/cms/login') {
    const payload: any = await requireAuth(event)
    if (!payload || !['SUPERADMIN', 'ADMIN'].includes(payload.role)) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
  }
})
