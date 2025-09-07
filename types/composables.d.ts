import type { User } from '@prisma/client'
import type { Ref, ComputedRef } from 'vue'

declare global {
  interface AuthState {
    user: Ref<User | null>
    isAuthenticated: ComputedRef<boolean>
    signIn: (credentials: { username: string; password: string }) => Promise<{ user: User }>
    signOut: () => Promise<void>
    register: (userData: { name: string; username: string; password: string }) => Promise<{ user: User }>
  }

  const useAuth: () => AuthState
}

declare module '#app' {
  interface NuxtApp {
    $auth: ReturnType<typeof useAuth>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: ReturnType<typeof useAuth>
  }
}
