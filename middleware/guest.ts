import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  
  // If user is already authenticated, redirect to dashboard
  if (user.value) {
    return navigateTo('/cms/dashboard')
  }
})
