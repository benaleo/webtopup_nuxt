import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (path.startsWith('/cms') && path !== '/cms/login') {
    const payload: any = await requireAuth(event)
    // Allow USER to access only the dashboard page
    const isDashboard = path === '/cms/dashboard'
    const allowedRoles = isDashboard ? ['SUPERADMIN', 'ADMIN', 'USER'] : ['SUPERADMIN', 'ADMIN']
    if (!payload || !allowedRoles.includes(payload.role)) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
  }
})
