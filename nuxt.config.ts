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
  // Expose runtime config for server utilities
  runtimeConfig: {
    auth: {
      // read from process.env.JWT_SECRET
      jwtSecret: process.env.JWT_SECRET,
    },
  },
})
