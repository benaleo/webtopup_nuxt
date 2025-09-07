import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (path.startsWith('/cms/register') || path.startsWith('/cms/login')) {
    try {
      // Check if user is already authenticated
      const token = getCookie(event, 'auth:token')
      if (token) {
        // If user is already logged in, redirect to dashboard
        await sendRedirect(event, '/cms/dashboard')
      }
    } catch (error) {
      // Ignore errors and continue with the request
      console.error('Guest middleware error:', error)
    }
  }
})
