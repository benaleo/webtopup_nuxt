import type { NavigationGuard } from 'vue-router'
import type { Ref } from 'vue'

// Extend Nuxt's auto-imported modules
declare global {
  // Nuxt auto-imports
  const navigateTo: (to: string) => Promise<void> | void
  const useState: <T>(key: string, init?: () => T) => Ref<T>
  const computed: typeof import('vue').computed
  const useRuntimeConfig: () => {
    public: {
      BASE_URL: string
    }
  }
  const defineNuxtRouteMiddleware: (middleware: NavigationGuard) => NavigationGuard
}

// Extend Vue's type system
declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: {
      user: Ref<{
        id: string
        username: string
        role: string
      } | null>
      isAuthenticated: boolean
      signIn: (credentials: { username: string; password: string }) => Promise<{ user: any }>
      signOut: () => Promise<void>
      register: (userData: { name: string; username: string; password: string }) => Promise<{ user: any }>
    }
  }
}

// Extend Nuxt's app context
declare module '#app' {
  interface NuxtApp {
    $auth: {
      user: Ref<{
        id: string
        username: string
        role: string
      } | null>
      isAuthenticated: boolean
      signIn: (credentials: { username: string; password: string }) => Promise<{ user: any }>
      signOut: () => Promise<void>
      register: (userData: { name: string; username: string; password: string }) => Promise<{ user: any }>
    }
  }
}
