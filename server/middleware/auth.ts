import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  // Skip middleware for public paths
  const publicPaths = ['/cms/login', '/cms/register']
  if (publicPaths.includes(path) || !path.startsWith('/cms')) {
    return
  }

  try {
    const payload: any = await requireAuth(event)
    // Allow USER to access only the dashboard page
    const isDashboard = path === '/cms/dashboard'
    const allowedRoles = isDashboard ? ['SUPERADMIN', 'ADMIN', 'USER'] : ['SUPERADMIN', 'ADMIN']
    
    if (!payload || !allowedRoles.includes(payload.role)) {
      await sendRedirect(event, '/')
    }
  } catch (error) {
    // If any error occurs (including 401 from requireAuth), redirect to main endpoint
    await sendRedirect(event, '/')
  }
})
