import type { User } from '@prisma/client'
import type { NavigationGuard } from 'vue-router'

declare module 'h3' {
  interface H3EventContext {
    user?: User
  }
}

declare module '#app' {
  interface PageMeta {
    middleware?: NavigationGuard | NavigationGuard[] | string | string[]
  }
}

declare module '#imports' {
  interface PageMeta {
    middleware?: NavigationGuard | NavigationGuard[] | string | string[]
  }
}

declare const defineNuxtRouteMiddleware: (middleware: NavigationGuard) => NavigationGuard
