// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  // Nuxt 4 compatibility
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  // TypeScript configuration
  typescript: {
    typeCheck: true,
    strict: true,
    tsConfig: {
      compilerOptions: {
        types: [
          'node',
          'vue'
        ],
        paths: {
          '~~/*': ['./*']
        }
      }
    }
  },
  // Auto-imports configuration
  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}'
    ]
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  runtimeConfig: {
    public: {
      BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
    },
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here'
    }
  },
  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  // Build configuration
  build: {
    transpile: ['vue-sonner']
  }
});